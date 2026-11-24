import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config.service";
import { randomUUID } from "node:crypto";
import { StoreEnum } from "../Enum/multer.enum";
import { createReadStream } from "node:fs";
import { Command } from "concurrently";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  private readonly client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile({
    ACL = ObjectCannedACL.private,
    path = "General",
    file,
    store_type = StoreEnum.memory,
  }: {
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
    store_type?: StoreEnum;
  }) {
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      ACL,
      Key: `social_media_app/${path}/${randomUUID()}___${file.originalname}`,
      Body:
        store_type === StoreEnum.memory
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    });
    await this.client.send(command);
    return command.input.Key;
  }
  async uploadLargeFile({
    ACL = ObjectCannedACL.private,
    path = "General",
    file,
    store_type = StoreEnum.disk,
  }: {
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
    store_type?: StoreEnum;
  }) {
    const command = new Upload({
      client: this.client,
      params: {
        Bucket: AWS_BUCKET_NAME,
        ACL,
        Key: `social_media_app/${path}/${randomUUID()}___${file.originalname}`,
        Body:
          store_type === StoreEnum.memory
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });
    const result = await command.done();
    return result.Key;
  }
  async uploadfiles({
    ACL = ObjectCannedACL.private,
    path = "General",
    files,
    store_type = StoreEnum.disk,
    isLarge = false,
  }: {
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
    store_type?: StoreEnum;
    isLarge?: Boolean;
  }) {
    let keys;
    if (isLarge) {
      await Promise.all(
        files.map((file) => {
          return this.uploadLargeFile({ file, path, store_type, ACL });
        }),
      );
    } else {
      keys = await Promise.all(
        files.map((file) => {
          return this.uploadFile({ file, path, store_type, ACL });
        }),
      );
    }
  }
  async getFile(Key: string) {
    const command = new GetObjectCommand({
      Key,
      Bucket: AWS_BUCKET_NAME,
    });
    return await this.client.send(command);
  }
  async createpresignedUrl({
    path,
    fileName,
    ContentType,
    expiresIn = 60 * 5,
  }: {
    path: string;
    fileName: string;
    ContentType: string;
    expiresIn?: number;
  }) {
    const Key = `social_media_app/${path}/${randomUUID()}___${fileName}`;
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key,
      ContentType,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, Key };
  }
  async getpresignedUrl({
    Key,
    expiresIn = 60 * 5,
    download,
  }: {
    Key: string;
    expiresIn?: number;
    download?: string | undefined;
  }) {
    const command = new GetObjectCommand({
      Key,
      Bucket: AWS_BUCKET_NAME,
      ResponseContentDisposition: download
        ? `attachment; filename="${Key.split("/").pop()}"`
        : undefined,
    });
    const url = await getSignedUrl(this.client, command, { expiresIn });
    return { url, Key };
  }
  async getFiles(folderName: string) {
    const command = new ListObjectsCommand({
      Prefix: `social_media_app/${folderName}/`,
      Bucket: AWS_BUCKET_NAME,
    });
    return await this.client.send(command);
  }
  async deleteFolder(folderName: string) {
    const { Contents } = await this.getFiles(folderName);
    const mappedData = Contents?.map((K) => {
      return K.Key;
    });
    return await this.deleteFiles(mappedData as string[]);
  }

  async deleteFile(Key: string) {
    const command = new DeleteObjectCommand({
      Key,
      Bucket: AWS_BUCKET_NAME,
    });
    return await this.client.send(command);
  }
  async deleteFiles(Key: string[]) {
    const mappedKey = Key.map((K) => {
      return { Key: K };
    });
    const command = new DeleteObjectsCommand({
      Bucket: AWS_BUCKET_NAME,
      Delete: {
        Objects: mappedKey,
      },
    });
    return await this.client.send(command);
  }
}
