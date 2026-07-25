/** Cloudflare Worker — vinext 앱과 ER Business 문의 API를 함께 처리합니다. */
import vinextHandler from "vinext/server/app-router-entry";
import {
  handleContactRequest,
  type InquiryEmailBinding,
  type OutboundEmail,
} from "./contact";

type EmailMessageCtor = new (
  from: string,
  to: string,
  raw: string,
) => unknown;

type Env = {
  ASSETS?: {
    fetch(request: Request): Promise<Response> | Response;
  };
  INQUIRY_EMAIL: {
    send(message: unknown): Promise<void>;
  };
};

async function loadEmailMessage(): Promise<EmailMessageCtor> {
  // Keep this specifier non-static so Node prerender does not resolve the
  // Workers-only `cloudflare:email` module during vinext static export.
  const specifier = ["cloudflare", "email"].join(":");
  const emailModule = (await import(/* @vite-ignore */ specifier)) as {
    EmailMessage: EmailMessageCtor;
  };
  return emailModule.EmailMessage;
}

function createEmailBinding(
  binding: Env["INQUIRY_EMAIL"],
): InquiryEmailBinding {
  return {
    async send(message: OutboundEmail) {
      const EmailMessage = await loadEmailMessage();
      await binding.send(
        new EmailMessage(message.from, message.to, message.raw),
      );
    },
  };
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      return handleContactRequest(request, createEmailBinding(env.INQUIRY_EMAIL));
    }

    return vinextHandler.fetch(request, env, ctx);
  },
};

export default worker;
