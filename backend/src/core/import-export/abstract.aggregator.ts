import { Inject } from "@nestjs/common";
import { CompanyRepository, EventRepository, ShareholderRepository } from "src/data/repositories";
import { AggregatedData, AggregatorInterface, ImportContext } from "./import-export.interface";

export abstract class AbstractAggregator implements AggregatorInterface {
  @Inject(CompanyRepository) protected readonly companyRepo: CompanyRepository;
  @Inject(EventRepository) protected readonly eventRepo: EventRepository;
  @Inject(ShareholderRepository) protected readonly shareholderRepo: ShareholderRepository;

  public abstract importAggregate(context: ImportContext): Promise<AggregatedData>;
}
