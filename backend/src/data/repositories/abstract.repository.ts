import { Injectable } from "@nestjs/common";
import { mongoose, ReturnModelType } from "@typegoose/typegoose";
import { ClientSession } from "mongoose";

export interface AllOptions {
  lean?: boolean;
  hide?: boolean;
  defaults?: boolean;
  sort?: { [prop: string]: number };
}

@Injectable()
export class AbstractRepository<T> {
  protected session: ClientSession;

  constructor(protected model: ReturnModelType<any>, protected connection: mongoose.Connection = null) {}

  public get transaction() {
    return {
      start: async () => {
        if (this.connection) {
          this.session = await this.connection.startSession();
        }
        if (this.session) {
          this.session.startTransaction();
        }
      },
      commit: async () => {
        if (this.session) {
          await this.session.commitTransaction();
        }
      },
      abort: async () => {
        if (this.session) {
          await this.session.abortTransaction();
        }
      },
      end: async () => {
        if (this.session) {
          this.session.endSession();
          this.session = null;
        }
      }
    };
  }

  public async all(filters: {} = null, options: AllOptions = null): Promise<T[]> {
    if (!options || (options && !options.lean)) {
      return this.model.find(filters).sort(options?.sort);
    }
    return this.model
      .find(filters)
      .sort(options?.sort)
      .lean({ autopopulate: true, defaults: options?.defaults ?? true, hide: options ? options.hide ?? true : true });
  }

  public async validate(document: T) {
    return this.model.validate(document);
  }

  public async get(id: string, query: {} = null): Promise<T> {
    return this.model.findOne({ ...query, _id: id });
  }

  public async getOneBy(property, value, query: {} = null): Promise<T> {
    return this.model.findOne({ ...query, [property]: value });
  }

  public async create(body: T): Promise<T> {
    return this.model.create(this.session ? [body] : body, this.session ? { session: this.session } : null);
  }

  public async bulk(body: T[]): Promise<T[]> {
    const session = this.session ? { session: this.session } : null;
    const bulkOperations = [];
    for (const element of body) {
      const _id = (element as any)._id;
      if (_id) {
        bulkOperations.push(
          this.model.update(
            {
              _id
            },
            element,
            { upsert: true, ...session }
          )
        );
      } else {
        bulkOperations.push(this.model.create(element));
      }
    }
    return Promise.all(bulkOperations);
  }

  public async update(id: string, body: T, query: {} = null): Promise<T> {
    const session = this.session ? { session: this.session } : null;
    return this.model.findOneAndUpdate({ ...query, _id: id }, body, {
      new: true,
      ...session
    });
  }

  public async delete(id: string, query: {} = null): Promise<T> {
    return this.model.findOneAndDelete({ ...query, _id: id }, this.session ? { session: this.session } : null);
  }

  public async clear(company: string, key: string = null, ids: [] = []): Promise<T> {
    const query = { company };
    if (key && ids.length > 0) {
      query[key] = { $in: ids };
    }

    return this.model.deleteMany(query, this.session ? { session: this.session } : null);
  }
}
