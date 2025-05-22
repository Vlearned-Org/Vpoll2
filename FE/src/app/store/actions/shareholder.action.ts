import { Shareholder } from '@vpoll-shared/contract';

export class ShareholderAdd {
  static readonly type = '[Shareholder] Add';

  constructor(public eventId: string, public shareholder: Shareholder) {}
}

export class ShareholderUpdate {
  static readonly type = '[Shareholder] Update';

  constructor(
    public eventId: string,
    public shareholderId: string,
    public shareholder: Shareholder
  ) {}
}

export class ShareholderClear {
  static readonly type = '[Shareholder] Clear';
}

export class ShareholderFetchAll {
  static readonly type = '[Shareholder] Get List';
  constructor(public eventId: string) {}
}
