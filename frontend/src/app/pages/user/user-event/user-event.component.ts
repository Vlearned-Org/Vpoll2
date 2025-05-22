import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VotingOperation } from '@app/components/resolution-voting/resolution-voting.component';
import { AskQuestionModal } from '@app/modals/ask-question/ask-question.modal';
import { UserVotingModal } from '@app/modals/user-voting/user-voting.modal';
import { MeHttpService } from '@app/shared/http-services/me-http.service';
import { Proxy, Shareholder, UserEvent } from '@vpoll-shared/contract';
import { VotingResponseEnum } from '@vpoll-shared/enum';
import { ScriptService } from 'ngx-script-loader';
import { DialogService } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { WebRTCConfiguration, WebRTCPlayer } from 'wowza-webrtc-client';

import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

@Component({
  selector: 'app-user-event',
  templateUrl: './user-event.component.html',
  styleUrls: ['./user-event.component.scss'],
})
export class UserEventComponent implements OnInit, OnDestroy, AfterViewInit {
  public isLoaded = false;
  public userEvent: UserEvent;
  public votingForm: FormGroup;
  public VotingResponseEnum = VotingResponseEnum;
  public eventId: string;
  public question: string;
  public hideVoting = false;
  public nothideVoting = true;
  public isMeetingActive = false;

  authEndpoint = 'https://zoom.vpoll.com.my'
  sdkKey = 'TrrA3WNKTKCnFLjg6N_39g'
  meetingNumber = '73847093001'
  passWord = 'RCJTh9'
  role = 0
  userName = 'leochen9986'
  userEmail = 'leochen9986@gmail.com'
  registrantToken = ''
  zakToken = ''
  leaveUrl = 'https://dev.vpoll.com.my/#/events'

  client = ZoomMtgEmbedded.createClient();


  constructor(
    private route: ActivatedRoute,
    private me: MeHttpService,
    public httpClient: HttpClient,
    private dialogService: DialogService,
    private router: Router,
    private scriptService: ScriptService,
    @Inject(DOCUMENT) document,
    private ngZone: NgZone
  ) {}

  public async ngOnInit(): Promise<void> {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    forkJoin([this.me.joinEvent(this.eventId), this.me.eventById(this.eventId)])
      .pipe()
      .subscribe(([attendance, userEvent]) => {
        this.userEvent = userEvent;
        console.log(this.userEvent)
        if (
          !this.userEvent.chairmanIdentity.isChairman &&
          !this.userEvent.shareholderIdentity.isShareholder &&
          !this.userEvent.proxyIdentity.isProxy
        ) {
          this.hideVoting = true;
          this.nothideVoting = false;
        }
        //this.webrtc();
        // flowplayer('#player_container', {
        //   src: "https://cdn3.wowza.com/1/WW9mSmtqVDVHbFZx/L3NKdFNT/hls/live/playlist.m3u8",
        //   token: "eyJraWQiOiIwWE44RnRTYkQxblYiLCJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjIjoie1wiYWNsXCI6MzgsXCJpZFwiOlwiMFhOOEZ0U2JEMW5WXCJ9IiwiaXNzIjoiRmxvd3BsYXllciJ9.wHlyQZ86rIHD8ldgnpiWbmFBmR4zt_3FSj78GMk7lfQ1es7K8y0MuHzbqcJfp0lm6LcUbUkQ5PsazIsAybxivg"
        // })
        this.scriptService.loadScript(this.userEvent.event.setting.wowzaSdpUrl).subscribe(() => {
          // The script has been loaded and is now available for use
          // Initialize and configure the Wowza video player here, if needed
        });
      });
      this.me.getMe().subscribe((userData) => {
        console.log(userData)
        this.userEmail = userData.email; // Here you can access the user data
        this.userName = userData.name; 
      });
  }

  getSignature() {
    this.httpClient.post(this.authEndpoint, {
	    meetingNumber: this.userEvent.event.setting.wowzaSdpUrl,
      password:this.userEvent.event.setting.wowzaApplicationName,
	    role: this.role
    }).toPromise().then((data: any) => {
      if(data.signature) {
        console.log(data.signature)
        this.startMeeting(data.signature)
      } else {
        console.log(data)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  joinZoomMeeting() {
    console.log("Hey");
    if (this.userEvent.event.setting.wowzaStreamName) {
      window.open(this.userEvent.event.setting.wowzaStreamName, '_blank');
    } else {
      console.error('Zoom meeting URL is not available.');
    }
  }


  startMeeting(signature) {
    let meetingSDKElement = document.getElementById('meetingSDKElement');

    const setMeetingSize = () => {
      const { width, height } = meetingSDKElement.getBoundingClientRect();
      return { width, height };
    };
  
    const { width, height } = setMeetingSize();
    console.log(width);
    console.log(height);
    console.log("Oiiii");


    this.ngZone.runOutsideAngular(() => {
        this.client.init({
            zoomAppRoot: meetingSDKElement,
            language: 'en-US',
            customize: {
                video: {
                    isResizable: true,
                    viewSizes: {
                        default: {
                            width: width,
                            height: height
                        }
                    }
                }
            },
            patchJsMedia: true
        }).then(() => {
          console.log(this.userEvent.event.setting.wowzaSdpUrl);
          console.log(this.userEvent.event.setting.wowzaApplicationName);
            this.client.join({
                signature: signature,
                sdkKey: this.sdkKey,
                meetingNumber: this.userEvent.event.setting.wowzaSdpUrl,
                password: this.userEvent.event.setting.wowzaApplicationName,
                userName: this.userName,
                userEmail: this.userEmail,
                tk: this.registrantToken,
                zak: this.zakToken
            }).then(() => {
                console.log('joined successfully');
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log(error);
        });
    });
}



  public async ngAfterViewInit() {}

  public voteFor(proxy: Proxy) {
    const dialogRef = this.dialogService.open(UserVotingModal, {
      header: 'Proxy Voting',
      width: '70%',
      data: {
        event: this.userEvent.event,
        proxy,
        operation: VotingOperation.PROXY_VOTE,
        closeDialog: () => dialogRef.close(),
      },
    });
    dialogRef.onClose.subscribe(() => {});
  }




  public vote(shareholder: Shareholder & { remainderShares: number }) {
    const dialogRef = this.dialogService.open(UserVotingModal, {
      header: 'Shareholder Voting',
      width: '70%',
      data: {
        event: this.userEvent.event,
        shareholder,
        operation: VotingOperation.SHAREHOLDER_VOTE,
        closeDialog: () => dialogRef.close(),
      },
    });
    dialogRef.onClose.subscribe(() => {});
  }

  public ngOnDestroy(): void {}

  public askQuestion() {
    const dialogRef = this.dialogService.open(AskQuestionModal, {
      header: 'Ask Question',
      width: 'lg:60% 100%',
      data: {
        event: this.userEvent,
      },
    });
    dialogRef.onClose.subscribe(() => {});
  }

  public async leave() {
    console.log("Leave")
    await this.me.leaveEvent(this.eventId).toPromise();
    this.router.navigate(['/events']);
  }

  public webrtc() {
    const config: WebRTCConfiguration = {
      WEBRTC_SDP_URL: this.userEvent.event.setting.wowzaSdpUrl,
      WEBRTC_APPLICATION_NAME:
        this.userEvent.event.setting.wowzaApplicationName,
      WEBRTC_FRAME_RATE: 29,
      WEBRTC_AUDIO_BIT_RATE: 64,
      WEBRTC_VIDEO_BIT_RATE: 360,
    };

    var $video = document.querySelectorAll('video')[0];
    console.log( document.querySelectorAll('video'));
    if(this.hideVoting){
      $video = document.querySelectorAll('video')[1];
    }
    else{
      const videoInviteeElement = document.getElementById('hidewin');
      videoInviteeElement.style.display = 'none';

    }

    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        console.log( document.querySelectorAll('video'));
        console.log( document.querySelectorAll('video'));
      }, 100); // Delay execution by 100 milliseconds (adjust as needed)
    });
    

    const statusHandler = (status) => {
      console.log(status);
    };
    const playerInterface = new WebRTCPlayer(config, $video, statusHandler);

    const streamName = this.userEvent.event.setting.wowzaStreamName;
    playerInterface.connect(streamName);
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  public viewProxyVote(proxy: Proxy) {
    const dialogRef = this.dialogService.open(UserVotingModal, {
      header: 'Assigned Proxy Voting',
      width: '70%',
      data: {
        event: this.userEvent.event,
        proxy,
        operation: VotingOperation.SHAREHOLDER_REVOTE_FOR_OWN_PROXY,
      },
    });
    dialogRef.onClose.subscribe(() => {});
  }

  public voteAs2ndProxy(proxy: Proxy) {
    const dialogRef = this.dialogService.open(UserVotingModal, {
      header: 'Proxy Voting',
      width: '70%',
      data: {
        event: this.userEvent.event,
        proxy,
        operation: VotingOperation.CHAIRMAN_VOTE_AS_SECOND_PROXY,
      },
    });
    dialogRef.onClose.subscribe(() => {});
  }
}
