import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPictureBySlug, getAllPictures } from '@/lib/data/gallery-data';
import { ImageData } from '@/lib/services/image-api-service';

interface PictureDetailPageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate static params for all pictures at build time
 */
export async function generateStaticParams() {
  const pictures = await getAllPictures();
  return pictures.map((p) => ({
    slug: p.slug,
  }));
}

/**
 * Dynamic SEO Metadata per picture page
 */
export async function generateMetadata({ params }: PictureDetailPageProps): Promise<Metadata> {
  const picture = await getPictureBySlug(params.slug);
  if (!picture) {
    return {
      title: 'Акс ёфт нашуд',
    };
  }

  const title = `${picture.name} — Аксҳо ва тасвирҳои исломӣ`;
  const description = `Тасвири исломии бо матни "${picture.name}" бо сифати баланд дар сомонаи Quran.tj. Аксҳо ва дуоҳои исломӣ.`;
  const canonicalUrl = `https://www.quran.tj/gallery/${params.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      images: [
        {
          url: picture.url,
          width: 1200,
          height: 630,
          alt: picture.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [picture.url],
    },
  };
}

export default async function PictureDetailPage({ params }: PictureDetailPageProps) {
  const picture = await getPictureBySlug(params.slug);
  if (!picture) {
    notFound();
  }

  // Get related images (excluding the current one) to suggest underneath
  const allPictures = await getAllPictures();
  const relatedPictures = allPictures
    .filter((p) => p.slug !== params.slug)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // Schema.org ImageObject structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: picture.name,
    description: `Акси исломӣ бо матн: ${picture.name}`,
    contentUrl: picture.url,
    url: `https://www.quran.tj/gallery/${params.slug}`,
    encodingFormat: picture.url.endsWith('.png') ? 'image/png' : 'image/jpeg',
    representativeOfPage: true,
    thumbnailUrl: picture.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        padding: '80px 16px 40px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
        }}>
          {/* Back Navigation */}
          <Link href="/gallery" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '24px',
            cursor: 'pointer',
          }}>
            ← Бозгашт ба галерея
          </Link>

          {/* Main Card */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '24px',
            border: '1px solid var(--color-outline)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Image Wrapper */}
            <div style={{
              position: 'relative',
              width: '100%',
              backgroundColor: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <img
                src={picture.url}
                alt={picture.name}
                title={picture.name}
                width="1"
                height="1"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  display: 'block',
                }}
                fetchPriority="high"
                decoding="async"
              />
            </div>

            {/* Info and Actions */}
            <div style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: 'var(--color-text-primary)',
                lineHeight: '1.3',
              }}>
                {picture.name}
              </h1>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                paddingTop: '8px',
                borderTop: '1px solid var(--color-outline)',
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                }}>
                  Тасвири исломӣ бо матн
                </span>

                <a
                  href={picture.url}
                  download={picture.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(var(--color-primary-rgb, 0, 0, 0), 0.1)',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  Боргирӣ (Download)
                </a>
              </div>
            </div>
          </div>

          {/* Related Images Section */}
          {relatedPictures.length > 0 && (
            <div style={{
              marginTop: '48px',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '20px',
                color: 'var(--color-text-primary)',
              }}>
                Дигар тасвирҳои исломӣ
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '16px',
              }}>
                {relatedPictures.map((p) => (
                  <Link href={`/gallery/${p.slug}`} key={p.slug} style={{ textDecoration: 'none' }}>
                    <div style={{
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: '16px',
                      border: '1px solid var(--color-outline)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}>
                      <div style={{
                        position: 'relative',
                        aspectRatio: '1',
                        backgroundColor: 'var(--color-surface-variant)',
                        overflow: 'hidden',
                      }}>
                        <img
                          src={p.url}
                          alt={p.name}
                          width="1"
                          height="1"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div style={{
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {p.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
