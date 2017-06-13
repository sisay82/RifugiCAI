import {
  Component,Injectable
} from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BcMenuService{
  private selectSource = new Subject<string>();
  select$ = this.selectSource.asObservable();
  onSelect(){
      this.selectSource.next();
  }
}
