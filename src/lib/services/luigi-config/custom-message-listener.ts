/**
 * A representation of a custom message listener and the custom message the listener listens on.
 * See also {@link https://docs.luigi-project.io/docs/communication/?section=luigi-client-to-luigi-core}
 */
import { Observable, Subject } from 'rxjs';

export interface CustomMessageListener {
  /**
   * The custom message id the listener is registered for.
   */
  messageId(): string;
  changed$: Subject<void>;
  changed?: Observable<void>;

  /**
   * The callback to be executed when the custom message is send by Luigi.
   *
   * @param customMessage The message object, see also {@link https://docs.luigi-project.io/docs/luigi-client-api?section=sendcustommessage}
   * @param mfObject The micro frontend object, see also {@link https://docs.luigi-project.io/docs/luigi-core-api?section=getmicrofrontends}
   * @param mfNodesObject The nodes object of the micro frontend, see also {@link https://docs.luigi-project.io/docs/navigation-parameters-reference?section=node-parameters}
   */
  onCustomMessageReceived(
    customMessage: string,
    mfObject: any,
    mfNodesObject: any
  ): void;
}
