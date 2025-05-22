import { Component, OnInit } from '@angular/core';
import { EventContextService } from '@app/services/event-context.service';
import { Shareholder } from '@vpoll-shared/contract';
import { ShareholderTypeEnum } from '@vpoll-shared/enum';

@Component({
  selector: 'app-director-table',
  templateUrl: './director-table.component.html',
  styleUrls: ['./director-table.component.scss'],
})
export class DirectorTableComponent implements OnInit {
  public directorList: Array<Shareholder>;

  constructor(private eventContext: EventContextService) {}

  public ngOnInit(): void {
    if (this.eventContext.isContextLoaded) {
      this.directorList = this.eventContext.shareholders.filter(
        (shareholder) =>
          shareholder.shareholderType === ShareholderTypeEnum.CHAIRMAN ||
          shareholder.shareholderType === ShareholderTypeEnum.DIRECTOR
      );
    }
  }
}
