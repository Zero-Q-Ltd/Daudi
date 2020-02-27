import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { fromError } from 'stacktrace-js';

// import { LoggingService } from './services/logging-service.service';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {
  }

  handleError(error) {
    let loggingService;
    // const loggingService = this.injector.get(LoggingService);
    const location = this.injector.get(LocationStrategy);
    const message = error.message ? error.message : error.toString();
    const url = location instanceof PathLocationStrategy
      ? location.path() : '';
    // get the stack trace, lets grab the last 10 stacks only
    fromError(error).then(stackframes => {
      const stackString = stackframes
        .splice(0, 20)
        .map(function (sf) {
          return sf.toString();
        }).join('\n');
      // log on the server
      loggingService.log({ message, url, stack: stackString });
    });

  }

}
