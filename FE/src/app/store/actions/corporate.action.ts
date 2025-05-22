import { Corporate } from '@vpoll-shared/contract';

export class CorporateAdd {
  static readonly type = '[Corporate] Add';

  constructor(public eventId: string, public corporate: Corporate) {}
}

export class CorporateUpdate {
  static readonly type = '[Corporate] Update';

  constructor(
    public eventId: string,
    public corporateId: string,
    public corporate: Corporate
  ) {}
}

export class CorporateClear {
  static readonly type = '[Corporate] Clear';
}

export class CorporateFetchAll {
  static readonly type = '[Corporate] Get List';
  constructor(public eventId: string) {}
}
