import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { BehaviorSubject, Observable, of, from,  } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { AuthService } from './auth.service';

@Injectable()
export class ChatroomService {

  public chatrooms: Observable<any>;
  public changeChatroom: BehaviorSubject<string | null> = new BehaviorSubject(null);
  public selectedChatroom: Observable<any>;
  public selectedChatroomMessages: Observable<any>;

  constructor(
    private db: AngularFirestore,
    private loadingService: LoadingService,
    private authService: AuthService
  ) {
    this.selectedChatroom = this.changeChatroom.pipe(
      switchMap(chatroomId => {
        if (chatroomId) {
          return db.doc(`chatrooms/${chatroomId}`).valueChanges();
        }
        return of(null);
      })
    )

    this.selectedChatroomMessages = this.changeChatroom.pipe(
      switchMap(chatroomId => {
        if (chatroomId) {
          return db.collection(`chatrooms/${chatroomId}/messages`, ref => {
            return ref.orderBy('createdAt', 'desc').limit(100);
          })
          .valueChanges()
          .pipe(
            map(arr => arr.reverse())
          )
        }
        return of(null);
      })
    )

    this.chatrooms = db.collection('chatrooms').valueChanges();
  }

  public createMessage(text: string): void {
    const chatroomId = this.changeChatroom.value;
    const message = {
      message: text,
      createdAt: new Date(),
      sender: this.authService.currentUserSnapshot
    };

    this.db.collection(`chatrooms/${chatroomId}/messages`).add(message);
  }

}
