import { HttpClientException } from "@vpoll-shared/errors/global-exception.filter";
import axios from "axios";
import * as path from "path";
import { SimpleValidator } from "../notification.dto";
import { ChannelTypes } from "../notification.enum";
import { AbstractNotification } from "./abstract.notification";

const Handlebars = require("handlebars");
const fs = require("fs");

export class SimpleNotification extends AbstractNotification {
  public getChannels(): Array<string> {
    return [ChannelTypes.EMAIL];
  }

  public async setData(data: SimpleValidator): Promise<void> {
    const { subject, content, sender, ...extraData } = data;
    const baseHTML = fs.readFileSync(path.join(__dirname, "../../templates/notifications/base.html")).toString();

    const baseTemplate = Handlebars.compile(baseHTML);

    Handlebars.registerPartial("content", content);

    this.extraData = extraData ?? {};
    this.sender = sender ?? this.sender;
    this.content = baseTemplate({ goToVpoll: true });
    this.subject = subject ?? null;

    if (data.attachment) {
      const buffer = await axios
        .get(`http://filesystem:8083/storage/${data.attachment}`, {
          responseType: "arraybuffer"
        })
        .catch(e => {
          throw new HttpClientException(e);
        });
      this.attachment = [
        {
          data: buffer.data,
          filename: data.attachment
        }
      ];
      // FIXME: we remove the file as for now it s only used send by email
      // if we want to keep this generated file for other reason (avoid re-generate, speed, etc.) need to remove this line.
      await axios.delete(`http://filesystem:8083/storage/${data.attachment}`).catch(e => {
        throw new HttpClientException(e);
      });
    }
  }
}
