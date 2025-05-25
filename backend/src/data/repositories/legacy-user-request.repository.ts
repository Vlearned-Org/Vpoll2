import { Injectable } from "@nestjs/common";
import { ReturnModelType } from "@typegoose/typegoose";
import { InjectModel } from "nestjs-typegoose";
import { LegacyUserRequest, LegacyUserRequestStatus } from "../model/legacy-user-request.model";
import { AbstractRepository } from "./abstract.repository";

@Injectable()
export class LegacyUserRequestRepository extends AbstractRepository<LegacyUserRequest> {
  constructor(@InjectModel(LegacyUserRequest) protected readonly model: ReturnModelType<typeof LegacyUserRequest>) {
    super(model);
  }

  async create(requestData: Partial<LegacyUserRequest>): Promise<LegacyUserRequest> {
    const request = new this.model({
      ...requestData,
      status: LegacyUserRequestStatus.PENDING,
      createdAt: new Date()
    });
    return request.save();
  }

  async findAll(filters: any = {}): Promise<LegacyUserRequest[]> {
    return this.model
      .find(filters)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<LegacyUserRequest> {
    return this.model.findById(id).exec();
  }

  async findByStatus(status: LegacyUserRequestStatus): Promise<LegacyUserRequest[]> {
    return this.model
      .find({ status })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPending(): Promise<LegacyUserRequest[]> {
    return this.findByStatus(LegacyUserRequestStatus.PENDING);
  }

  async approve(
    id: string, 
    adminUserId: string, 
    adminNotes?: string
  ): Promise<LegacyUserRequest> {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: LegacyUserRequestStatus.APPROVED,
        processedBy: adminUserId,
        processedAt: new Date(),
        adminNotes
      },
      { new: true }
    ).exec();
  }

  async reject(
    id: string, 
    adminUserId: string, 
    rejectionReason: string,
    adminNotes?: string
  ): Promise<LegacyUserRequest> {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: LegacyUserRequestStatus.REJECTED,
        processedBy: adminUserId,
        processedAt: new Date(),
        rejectionReason,
        adminNotes
      },
      { new: true }
    ).exec();
  }

  async markAsProcessed(
    id: string, 
    createdUserId: string
  ): Promise<LegacyUserRequest> {
    return this.model.findByIdAndUpdate(
      id,
      {
        status: LegacyUserRequestStatus.PROCESSED,
        createdUserId
      },
      { new: true }
    ).exec();
  }

  async updateAdminNotes(
    id: string, 
    adminNotes: string
  ): Promise<LegacyUserRequest> {
    return this.model.findByIdAndUpdate(
      id,
      { adminNotes },
      { new: true }
    ).exec();
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    processed: number;
  }> {
    const [total, pending, approved, rejected, processed] = await Promise.all([
      this.model.countDocuments().exec(),
      this.model.countDocuments({ status: LegacyUserRequestStatus.PENDING }).exec(),
      this.model.countDocuments({ status: LegacyUserRequestStatus.APPROVED }).exec(),
      this.model.countDocuments({ status: LegacyUserRequestStatus.REJECTED }).exec(),
      this.model.countDocuments({ status: LegacyUserRequestStatus.PROCESSED }).exec()
    ]);

    return { total, pending, approved, rejected, processed };
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}