import { Injectable } from '@angular/core';
import { CorporateHttpService } from '@app/shared/http-services/corporate-http.service';
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext,
} from '@ngxs/store';

import { Corporate } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { take, tap } from 'rxjs';
import {
  CorporateAdd,
  CorporateClear,
  CorporateFetchAll,
  CorporateUpdate,
} from './actions/corporate.action';

export class CorporateStateModel {
  public corporateMap: Map<string, Corporate>;
}

@State<CorporateStateModel>({
  name: 'corporate',
  defaults: {
    corporateMap: new Map<string, Corporate>(),
  },
})
@Injectable()
export class CorporateState {
  private lastLoadAt: Date;

  constructor(
    private corporateHttpSvc: CorporateHttpService,
    private messageSvc: MessageService
  ) {}

  @Selector()
  static corporates(state: CorporateStateModel): Array<Corporate> {
    return Array.from(state.corporateMap.values());
  }

  @Selector()
  static corporateMap(
    state: CorporateStateModel
  ): Map<string, Corporate> {
    return state.corporateMap;
  }

  static corporate(corporateId: string) {
    return createSelector(
      [CorporateState],
      (state: CorporateStateModel): Corporate => {
        return state.corporateMap.get(corporateId);
      }
    );
  }

  private updateCorporateInStore(
    context: StateContext<CorporateStateModel>,
    corporate: Corporate
  ) {
    const state = context.getState();
    const corporateMap = new Map(state.corporateMap);
    corporateMap.set(corporate._id, corporate);

    context.setState({
      ...state,
      corporateMap,
    });
  }

  @Action(CorporateAdd)
  addCorporate(
    { getState, patchState }: StateContext<CorporateStateModel>,
    { eventId, corporate }: CorporateAdd
  ) {
    return this.corporateHttpSvc.createCorporate(eventId, corporate).pipe(
      tap((corporate) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          detail: `Corporate ${corporate.name} created successfully.`,
        });
        const state = getState();
        const corporateMap = new Map([
          [corporate._id, corporate],
          ...state.corporateMap,
        ]);
        patchState({
          corporateMap,
        });
      })
    );
  }

  @Action(CorporateUpdate)
  updateCorporate(
    context: StateContext<CorporateStateModel>,
    { eventId, corporateId, corporate }: CorporateUpdate
  ) {
    return this.corporateHttpSvc
      .updateCorporate(eventId, corporateId, corporate)
      .pipe(
        tap((corporate) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            detail: `Corporate ${corporate.name} updated successfully.`,
          });
          this.updateCorporateInStore(context, corporate);
        })
      );
  }

  @Action(CorporateClear)
  clearCorporates({
    getState,
    setState,
  }: StateContext<CorporateStateModel>) {
    this.lastLoadAt = null;
    setState({
      corporateMap: new Map<string, Corporate>(),
    });
  }

  @Action(CorporateFetchAll)
  fetchCorporates(
    { getState, setState }: StateContext<CorporateStateModel>,
    action: CorporateFetchAll
  ) {
    // if (
    //   !this.lastLoadAt ||
    //   moment(this.lastLoadAt).add(10, 'second').isBefore(new Date())
    // ) {
    //   this.lastLoadAt = new Date();
    return this.corporateHttpSvc.listCorporates(action.eventId).pipe(
      take(1),
      tap((corporates) => {
        const state = getState();
        setState({
          ...state,
          corporateMap: new Map<string, Corporate>(
            corporates.map((corporate) => [corporate._id, corporate])
          ),
        });
      })
    );
    // } else {
    //   const state = getState();
    //   setState({
    //     ...state,
    //   });
    //   return EMPTY;
    // }
  }
}
