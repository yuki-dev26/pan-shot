"use client";

import {
  BookOpen,
  ExternalLink,
  MessageCircle,
  Scale,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import creatorIcon from "../../assets/yuki-p.webp";
import { useT } from "../i18n/context";
import type { MessageKey } from "../i18n/config";

function assetSrc(asset: string | { src: string }): string {
  return typeof asset === "string" ? asset : asset.src;
}

const DEVELOPER_SITE_URL = "https://yukip02.com/";
const CONTACT_URL = "https://yukip02.com/contact";

const bodyText = "m-0 text-sm leading-relaxed text-muted sm:text-[0.95rem]";

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <h3 className="m-0 mb-3 flex items-center gap-2 font-display text-[0.95rem] tracking-tight text-ink sm:text-base">
      <Icon
        className="size-4 shrink-0 text-accent"
        strokeWidth={1.75}
        aria-hidden
      />
      {children}
    </h3>
  );
}

export function SiteInfo() {
  const t = useT();

  return (
    <section
      className="mt-2 animate-rise sm:mt-4"
      aria-labelledby="site-info-heading"
      style={{ animationDelay: "120ms" }}
    >
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <div className="h-px flex-1 bg-line" aria-hidden />
        <h2
          id="site-info-heading"
          className="m-0 shrink-0 font-display text-xs tracking-[0.22em] text-muted uppercase"
        >
          {t("info.section")}
        </h2>
        <div className="h-px flex-1 bg-line" aria-hidden />
      </div>

      <div className="grid gap-8 sm:gap-10 md:grid-cols-[1fr_1fr_minmax(16rem,0.9fr)] md:grid-rows-[auto_auto] md:items-start md:gap-x-8 lg:gap-x-10">
        <div className="order-1 md:col-start-1 md:row-start-1 md:row-span-2">
          <SectionHeading icon={BookOpen}>
            {t("info.howto.title")}
          </SectionHeading>
          <ol className="m-0 grid list-none gap-2.5 p-0">
            {(
              [
                "info.howto.step1",
                "info.howto.step2",
                "info.howto.step3",
              ] as const satisfies MessageKey[]
            ).map((key, i) => (
              <li key={key} className="flex items-center gap-3">
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/12 font-display text-[0.8rem] leading-none text-accent"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span className={bodyText}>{t(key)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="order-2 md:col-start-2 md:row-start-1">
          <SectionHeading icon={UserRound}>
            {t("info.developer.title")}
          </SectionHeading>
          <a
            href={DEVELOPER_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 no-underline"
          >
            <img
              src={assetSrc(creatorIcon)}
              alt=""
              width={44}
              height={44}
              className="size-11 rounded-full border border-line object-cover transition-[border-color,box-shadow] duration-200 group-hover:border-accent/50 group-hover:shadow-[0_0_0_3px_rgb(110_182_255/0.12)]"
              draggable={false}
            />
            <span className="grid gap-0.5">
              <span className="font-display text-[0.95rem] tracking-tight text-ink transition-colors duration-200 group-hover:text-accent">
                {t("info.developer.name")}
              </span>
              <span className="text-xs text-muted">yukip02.com</span>
            </span>
          </a>
        </div>

        <div className="order-3 md:col-start-2 md:row-start-2">
          <SectionHeading icon={MessageCircle}>
            {t("info.contact.title")}
          </SectionHeading>
          <p className={`${bodyText} mb-3.5`}>{t("info.contact.body")}</p>
          <a
            href={CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 border border-accent/40 bg-accent/8 px-4 py-2.5 font-sans text-sm text-ink no-underline transition-[background,border-color,transform] duration-200 hover:-translate-y-px hover:border-accent/70 hover:bg-accent/14"
          >
            <span className="font-medium tracking-tight">
              {t("info.contact.cta")}
            </span>
            <ExternalLink
              className="size-3.5 shrink-0 text-muted"
              strokeWidth={1.75}
              aria-hidden
            />
          </a>
        </div>

        <div className="order-4 md:col-start-3 md:row-start-1">
          <SectionHeading icon={ShieldCheck}>
            {t("info.privacy.title")}
          </SectionHeading>
          <ul className="m-0 grid list-none gap-2.5 p-0">
            {(
              [
                "info.privacy.item1",
                "info.privacy.item2",
                "info.privacy.item3",
              ] as const satisfies MessageKey[]
            ).map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/70"
                  aria-hidden
                />
                <span className={bodyText}>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-5 md:col-start-3 md:row-start-2">
          <SectionHeading icon={Scale}>
            {t("info.disclaimer.title")}
          </SectionHeading>
          <p className={bodyText}>{t("info.disclaimer.body")}</p>
        </div>
      </div>
    </section>
  );
}
