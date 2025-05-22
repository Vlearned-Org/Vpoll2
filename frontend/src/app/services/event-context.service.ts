import { Injectable } from '@angular/core';
import { EventHttpService } from '@app/shared/http-services/event-http.service';

import { ShareholderFetchAll } from '@app/store/actions/shareholder.action';

import { ShareholderState } from '@app/store/shareholder-state.service';
import { Store } from '@ngxs/store';
import { Event, Shareholder } from '@vpoll-shared/contract';
import {
  BehaviorSubject,
  map,
  Observable,
  switchMap,
  withLatestFrom,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventContextService {
  private isContextLoaded$ = new BehaviorSubject<boolean>(false);
  public eventId: string;
  private event$ = new BehaviorSubject<Event>(null);
  private shareholders$ = new BehaviorSubject<Shareholder[]>([]);

  constructor(private store: Store, private eventHttpSvc: EventHttpService) {}

  public selectedEvent(eventId: string) {
    this.eventId = eventId;
    return this.eventHttpSvc.getEvent(eventId).pipe(
      switchMap((event) => {
        this.event$.next(event);
        return this.store
          .dispatch([new ShareholderFetchAll(eventId)])
          .pipe(
            withLatestFrom(this.store.select(ShareholderState.shareholders))
          )
          .pipe(
            map(([_, shareholders]) => {
              this.event$.next(event);
              this.shareholders$.next(shareholders);
              this.isContextLoaded$.next(true);
              return this.isContextLoaded$.value;
            })
          );
      })
    );
  }

  public reloadEvent(event: Event) {
    this.event$.next(event);
  }

  public reloadEventShareholders(): Observable<Shareholder[]> {
    return this.store.select(ShareholderState.shareholders).pipe(
      map((shareholders) => {
        console.log('Shareholders reloaded');
        this.shareholders$.next(shareholders);
        return shareholders;
      })
    );
  }

  public get event(): Event {
    return this.event$.value;
  }

  public get shareholders(): Array<Shareholder> {
    return this.shareholders$.value;
  }

  public get isContextLoaded(): boolean {
    return this.isContextLoaded$.value;
  }
}