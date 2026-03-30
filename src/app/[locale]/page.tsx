import Image from "next/image";
import Link from "next/link";
import styles from "./home-page.module.css";

import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import { defaultLocale, isValidLocale } from "@/src/i18n/config";
import { getDictionary } from "@/src/i18n/get-dictionary";

type Props = {
  params: {
    locale: string;
  };
};

export default function Home({ params }: Props) {
  const locale = isValidLocale(params.locale) ? params.locale : defaultLocale;
  const t = getDictionary(locale);

  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto 18px auto",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <LanguageSwitcher currentLocale={locale} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroTextWrap}>
            <div className={styles.brandBadgeWrap}>
              <img
                src="/logo-white.png"
                alt={`${t.common.appName} Logo`}
                className={styles.heroBrandLogo}
              />
            </div>

            <h1 className={styles.heroTitle}>
              {t.home.hero.title1}
              <br />
              {t.home.hero.title2}
            </h1>

            <p className={styles.heroText}>{t.home.hero.text}</p>

            <div className={styles.heroButtons}>
              <Link href="/get-app" className={styles.primaryButton}>
                {t.home.hero.ctaPrimary}
              </Link>
              <Link href={`/${locale}#features`} className={styles.secondaryButton}>
                {t.home.hero.ctaSecondary}
              </Link>
            </div>

            <div className={styles.heroFacts}>
              <div className={styles.factCard}>
                <strong className={styles.factNumber}>{t.home.hero.factScanTitle}</strong>
                <span className={styles.factLabel}>{t.home.hero.factScanText}</span>
              </div>

              <div className={styles.factCard}>
                <strong className={styles.factNumber}>{t.home.hero.factMapTitle}</strong>
                <span className={styles.factLabel}>{t.home.hero.factMapText}</span>
              </div>

              <div className={styles.factCard}>
                <strong className={styles.factNumber}>{t.home.hero.factQrxTitle}</strong>
                <span className={styles.factLabel}>{t.home.hero.factQrxText}</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualStage}>
              <div className={styles.glowOne} />
              <div className={styles.glowTwo} />

              <div className={styles.phoneMockup}>
                <div className={styles.phoneHeader}>
                  <span className={styles.phoneDot} />
                  <span className={styles.phoneDot} />
                  <span className={styles.phoneDot} />
                </div>

                <div className={styles.heroLogoShowcase}>
                  <div className={styles.heroLogoShell}>
                    <img
                      src="/logo-white.png"
                      alt={`${t.common.appName} Hero Logo`}
                      className={styles.heroLogo}
                    />
                  </div>

                  <div className={styles.heroLogoTextWrap}>
                    <span className={styles.heroLogoTitle}>{t.common.appName}</span>
                    <span className={styles.heroLogoSubtitle}>
                      {t.home.download.brandSubtitle}
                    </span>
                  </div>
                </div>

                <div className={styles.phoneCardPrimary}>
                  <p className={styles.phoneOverline}>{t.home.features.eyebrow}</p>
                  <h3 className={styles.phoneCardTitle}>{t.home.hero.mockupTitle}</h3>
                  <p className={styles.phoneCardText}>{t.home.hero.mockupText}</p>
                </div>

                <div className={styles.phoneActionRow}>
                  <div className={styles.phoneActionChip}>{t.home.hero.chip1}</div>
                  <div className={styles.phoneActionChip}>{t.home.hero.chip2}</div>
                  <div className={styles.phoneActionChip}>{t.home.hero.chip3}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.features.eyebrow}</span>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
            {t.home.features.title}
          </h2>
          <p className={styles.sectionText}>{t.home.features.text}</p>
        </div>

        <div className={styles.featureStack}>
          <div className={styles.featureShowcase}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/scan-screen.jpg"
                alt={t.home.features.item1Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item1Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item1Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item1Text}</p>
            </div>
          </div>

          <div className={styles.featureShowcaseReverse}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/map-screen.jpg"
                alt={t.home.features.item2Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item2Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item2Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item2Text}</p>
            </div>
          </div>

          <div className={styles.featureShowcase}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/updates-screen.jpg"
                alt={t.home.features.item3Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item3Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item3Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item3Text}</p>
            </div>
          </div>

          <div className={styles.featureShowcaseReverse}>
            <div className={styles.featureImageWrap}>
              <Image
                src="/landing/create-screen.jpg"
                alt={t.home.features.item4Title}
                width={1080}
                height={1920}
                className={styles.featureImage}
              />
            </div>

            <div className={styles.featureTextWrap}>
              <span className={styles.featureBadge}>{t.home.features.item4Badge}</span>
              <h3 className={styles.featureHeadline}>{t.home.features.item4Title}</h3>
              <p className={styles.featureBody}>{t.home.features.item4Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.target.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{t.home.target.title}</h2>
          <p className={styles.sectionText}>{t.home.target.text}</p>
        </div>

        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>{t.home.target.card1Title}</h3>
            <p className={styles.featureText}>{t.home.target.card1Text}</p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>{t.home.target.card2Title}</h3>
            <p className={styles.featureText}>{t.home.target.card2Text}</p>
          </div>

          <div className={styles.valueCard}>
            <h3 className={styles.featureTitle}>{t.home.target.card3Title}</h3>
            <p className={styles.featureText}>{t.home.target.card3Text}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.compare.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{t.home.compare.title}</h2>
        </div>

        <div className={styles.compareGrid}>
          <div className={styles.compareCard}>
            <div className={styles.compareLabel}>{t.home.compare.normalLabel}</div>
            <h3 className={styles.compareTitle}>{t.home.compare.normalTitle}</h3>
            <ul className={styles.compareList}>
              <li>{t.home.compare.normal1}</li>
              <li>{t.home.compare.normal2}</li>
              <li>{t.home.compare.normal3}</li>
            </ul>
          </div>

          <div className={styles.compareCardFeatured}>
            <div className={styles.compareLabelFeatured}>{t.home.compare.qrxLabel}</div>
            <h3 className={styles.compareTitleFeatured}>{t.home.compare.qrxTitle}</h3>
            <ul className={styles.compareListFeatured}>
              <li>{t.home.compare.qrx1}</li>
              <li>{t.home.compare.qrx2}</li>
              <li>{t.home.compare.qrx3}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionIntro}>
          <span className={styles.sectionEyebrow}>{t.home.pricing.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{t.home.pricing.title}</h2>
          <p className={styles.sectionText}>{t.home.pricing.text}</p>
        </div>

        <div className={styles.pricingWrap}>
          <div className={styles.pricingCardPrimary}>
            <h3 className={styles.pricingTitle}>{t.home.pricing.howTitle}</h3>
            <ul className={styles.pricingList}>
              <li>{t.home.pricing.how1}</li>
              <li>{t.home.pricing.how2}</li>
              <li>{t.home.pricing.how3}</li>
            </ul>
          </div>

          <div className={styles.pricingCardSecondary}>
            <h3 className={styles.pricingTitle}>{t.home.pricing.benefitsTitle}</h3>
            <ul className={styles.pricingList}>
              <li>{t.home.pricing.benefits1}</li>
              <li>{t.home.pricing.benefits2}</li>
              <li>{t.home.pricing.benefits3}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.downloadSection}>
        <div className={styles.downloadCard}>
          <div className={styles.downloadTop}>
            <div className={styles.downloadBrand}>
              <div className={styles.downloadLogoWrap}>
                <img
                  src="/logo-white.png"
                  alt={`${t.common.appName} Download Logo`}
                  className={styles.downloadLogo}
                />
              </div>

              <div className={styles.downloadBrandText}>
                <span className={styles.downloadBrandTitle}>{t.common.appName}</span>
                <span className={styles.downloadBrandSubtitle}>
                  {t.home.download.brandSubtitle}
                </span>
              </div>
            </div>

            <div className={styles.downloadButtons}>
              <Link href="/get-app" className={styles.downloadPrimaryButton}>
                {t.home.download.ctaPrimary}
              </Link>
              <Link href="/datenschutz" className={styles.downloadSecondaryButton}>
                {t.home.download.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card1Title}</div>
              <p className={styles.trustText}>{t.home.download.card1Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card2Title}</div>
              <p className={styles.trustText}>{t.home.download.card2Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card3Title}</div>
              <p className={styles.trustText}>{t.home.download.card3Text}</p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustTitle}>{t.home.download.card4Title}</div>
              <p className={styles.trustText}>{t.home.download.card4Text}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}