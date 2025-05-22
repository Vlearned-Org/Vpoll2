import { Injectable } from '@angular/core';
import { ShareholderHttpService } from '@app/shared/http-services/shareholder-http.service';
import {
  Action,
  createSelector,
  Selector,
  State,
  StateContext,
} from '@ngxs/store';
import { Shareholder } from '@vpoll-shared/contract';
import { MessageService } from 'primeng/api';
import { take, tap } from 'rxjs';
import {
  ShareholderAdd,
  ShareholderClear,
  ShareholderFetchAll,
  ShareholderUpdate,
} from './actions/shareholder.action';

export class ShareholderStateModel {
  public shareholderMap: Map<string, Shareholder>;
}

@State<ShareholderStateModel>({
  name: 'shareholder',
  defaults: {
    shareholderMap: new Map<string, Shareholder>(),
  },
})
@Injectable()
export class ShareholderState {
  private lastLoadAt: Date;

  constructor(
    private shareholderHttpSvc: ShareholderHttpService,
    private messageSvc: MessageService
  ) {}

  @Selector()
  static shareholders(state: ShareholderStateModel): Array<Shareholder> {
    return Array.from(state.shareholderMap.values());
  }

  @Selector()
  static shareholderMap(
    state: ShareholderStateModel
  ): Map<string, Shareholder> {
    return state.shareholderMap;
  }

  static shareholder(shareholderId: string) {
    return createSelector(
      [ShareholderState],
      (state: ShareholderStateModel): Shareholder => {
        return state.shareholderMap.get(shareholderId);
      }
    );
  }

  private updateShareholderInStore(
    context: StateContext<ShareholderStateModel>,
    shareholder: Shareholder
  ) {
    const state = context.getState();
    const shareholderMap = new Map(state.shareholderMap);
    shareholderMap.set(shareholder._id, shareholder);

    context.setState({
      ...state,
      shareholderMap,
    });
  }

  @Action(ShareholderAdd)
  addShareholder(
    { getState, patchState }: StateContext<ShareholderStateModel>,
    { eventId, shareholder }: ShareholderAdd
  ) {
    return this.shareholderHttpSvc.createShareholder(eventId, shareholder).pipe(
      tap((shareholder) => {
        this.messageSvc.add({
          key: 'toast',
          severity: 'success',
          detail: `Shareholder ${shareholder.name} created successfully.`,
        });
        const state = getState();
        const shareholderMap = new Map([
          [shareholder._id, shareholder],
          ...state.shareholderMap,
        ]);
        patchState({
          shareholderMap,
        });
      })
    );
  }

  @Action(ShareholderUpdate)
  updateShareholder(
    context: StateContext<ShareholderStateModel>,
    { eventId, shareholderId, shareholder }: ShareholderUpdate
  ) {
    return this.shareholderHttpSvc
      .updateShareholder(eventId, shareholderId, shareholder)
      .pipe(
        tap((shareholder) => {
          this.messageSvc.add({
            key: 'toast',
            severity: 'success',
            detail: `Shareholder ${shareholder.name} updated successfully.`,
          });
          this.updateShareholderInStore(context, shareholder);
        })
      );
  }

  @Action(ShareholderClear)
  clearShareholders({
    getState,
    setState,
  }: StateContext<ShareholderStateModel>) {
    this.lastLoadAt = null;
    setState({
      shareholderMap: new Map<string, Shareholder>(),
    });
  }

  @Action(ShareholderFetchAll)
  fetchShareholders(
    { getState, setState }: StateContext<ShareholderStateModel>,
    action: ShareholderFetchAll
  ) {
    // if (
    //   !this.lastLoadAt ||
    //   moment(this.lastLoadAt).add(10, 'second').isBefore(new Date())
    // ) {
    //   this.lastLoadAt = new Date();
    return this.shareholderHttpSvc.listShareholders(action.eventId).pipe(
      take(1),
      tap((shareholders) => {
        const state = getState();
        setState({
          ...state,
          shareholderMap: new Map<string, Shareholder>(
            shareholders.map((shareholder) => [shareholder._id, shareholder])
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
