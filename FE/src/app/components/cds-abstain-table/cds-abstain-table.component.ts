import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Shareholder } from '@vpoll-shared/contract';

@Component({
  selector: 'app-cds-abstain-table',
  templateUrl: './cds-abstain-table.component.html',
  styleUrls: ['./cds-abstain-table.component.scss'],
})
export class CdsAbstainTableComponent implements OnInit, OnChanges {
  @Input() cdsAbstainList: Array<string>;
  @Input() shareholders: Array<Shareholder>;
  public shareholderAbstainList: Array<Shareholder>;

  public ngOnInit(): void {
    this.getAbstainedShareholder(this.cdsAbstainList);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const cdsAbstainList: Array<string> =
      changes['cdsAbstainList'].currentValue;
    if (
      cdsAbstainList.length !== this.cdsAbstainList.length &&
      !cdsAbstainList.every((id) => this.cdsAbstainList.includes(id))
    ) {
      this.getAbstainedShareholder(cdsAbstainList);
    }
  }

  private getAbstainedShareholder(cdsAbstainList: Array<string>) {
    this.shareholderAbstainList = cdsAbstainList.map((cds) =>
      this.shareholders.find((shareholder) => shareholder.cds === cds)
    );
  }
}
