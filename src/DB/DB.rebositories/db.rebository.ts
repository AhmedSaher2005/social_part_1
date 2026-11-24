import {
  Model,
  PopulateOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
} from "mongoose";

export abstract class DBRebository<T> {
  constructor(public readonly model: Model<T>) {}

  create = async (data: Partial<T>) => {
    return await this.model.create([data]);
  };
  findOne = async ({
    filter,
    projection,
    option,
  }: {
    filter: QueryFilter<T>;
    projection?: ProjectionType<T>;
    option?: QueryOptions;
  }) => {
    return await this.model.findOne(filter, projection, option);
  };
  find = async ({
    filter,
    option,
  }: {
    filter: QueryFilter<T>;
    projection?: ProjectionType<T>;
    option?: QueryOptions;
  }) => {
    const data = this.model.find(filter, option);
    if (option?.limit) {
      data.limit(option?.limit);
    }
    if (option?.sort) {
      data.sort(option?.sort);
    }
    if (option?.skip) {
      data.skip(option?.skip);
    }
    if (option?.populate) {
      data.populate(option?.populate as PopulateOptions);
    }
    return data.exec();
  };

  findById = async ({ id, option }: { id: any; option?: QueryOptions }) => {
    return await this.model.findById(id, option);
  };
  findByIdAndUpdate = async ({
    id,
    update,
    option,
  }: {
    id: any;
    update: UpdateQuery<T>;
    option?: QueryOptions<T>;
  }) => {
    return await this.model.findByIdAndUpdate(id, update, {
      new: true,
      runvalidator: true,
      ...option,
    });
  };
  findOneAndUpdate = async ({
    filter,
    update,
    option,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    option?: QueryOptions;
  }) => {
    return await this.model.findOneAndUpdate(filter, update, {
      new: true,
      runvalidator: true,
      ...option,
    });
  };
  deleteMany = async ({
    filter,
    option,
  }: {
    filter: QueryFilter<T>;
    option?: QueryOptions<T>;
  }) => {
    return await this.model.findOne(filter, option);
  };
}
