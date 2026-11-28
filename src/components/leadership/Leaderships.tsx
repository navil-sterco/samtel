import "./leadership.css";
import Image from "next/image";
import Link from "next/link";
import { BASE_URL } from "@/config/config";
import PaginationWrapper from "../common/pagination/PaginationWrapper";

interface LeaderItem {
  id: number;
  name: string;
  image: string | null;
  mobile_image: string | null;
  designation: string | null;
  message: string | null;
  slug: string;
  display_order?: string;
}

// Shape of the full API response: { status, data: { first, rest }, meta }
export interface LeadershipResponse {
  status?: boolean;
  data: {
    first: LeaderItem | null;
    rest: LeaderItem[];
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page?: number;
    total?: number;
  };
}

const PLACEHOLDER = "/assets/images/placeholders/leadership.webp";

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18.666"
    height="7.74"
    viewBox="0 0 18.666 7.74"
  >
    <g transform="translate(0.296 0.354)">
      <line
        x2="18"
        transform="translate(-0.296 3.482)"
        fill="none"
        stroke=""
        strokeWidth="1"
      ></line>
      <path
        d="M1288.879,911.93l3.517,3.517-3.517,3.517"
        transform="translate(-1274.732 -911.93)"
        fill="none"
        stroke=""
        strokeWidth="1"
      ></path>
    </g>
  </svg>
);

export default function Leaderships({
  pageData,
}: {
  pageData: LeadershipResponse;
}) {
  const first = pageData?.data?.first ?? null;
  const rest = pageData?.data?.rest ?? [];

  return (
    <section className="leadership_sec">
      {/* ---------- Top / featured leader ---------- */}
      {first && (
        <div className="container-full">
          <div className="leadship_top">
            <div className="leadship_img">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={first.mobile_image || "/assets/images/leadership_pic.webp"}
                  type="image/webp"
                />

                <Image
                  src={first.image || "/assets/images/leadership_pic.webp"}
                  alt={first.name || "Leadership"}
                  width={1920}
                  height={800}
                  className="img-fluid w-100"
                  priority
                  sizes="100vw"
                />
              </picture>

              <div className="leadership_detail">
                {first.message && (
                  <p
                    className="fade-up"
                    data-delay="0.3"
                    data-duration="2"
                    dangerouslySetInnerHTML={{ __html: first.message }}
                  />
                )}
               
                <h2 className="fade-up" data-delay="0.3" data-duration="2.3" dangerouslySetInnerHTML={{ __html: first.name }} />
                {first.designation && (
                  <h3 className="fade-up" data-delay="0.3" data-duration="3" dangerouslySetInnerHTML={{ __html: first.designation }} />
                )}

                {first.slug && (
                  <Link
                    href={`${BASE_URL}leadership/${first.slug}`}
                    className="more_btn fade-up"
                    data-delay="0.3"
                    data-duration="3.1"
                    aria-label={first.name}
                  >
                    <Image
                      src="/assets/images/right-arrow-white.svg"
                      alt="right arrow"
                      width={20}
                      height={20}
                      className="img-fluid"
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Rest of the team ---------- */}
      <div className="container">
        <div className="col-lg-10 mx-auto">
          <div className="ledrsp_list">
            {rest.map((item) => (
              <div key={item.id} className="ledrsp_bx">
                <figure>
                  <Image
                    src={item.image || PLACEHOLDER}
                    className="img-fluid w-100"
                    alt={item.name || "Leadership"}
                    width={343}
                    height={389}
                    loading="lazy"
                  />
                </figure>
                <div className="ledrsp_content">
                  <div className="ledrsp_txt">
                    <div className="ledrsp_txt_lft">
                      <h5 dangerouslySetInnerHTML={{ __html: item.name }} />
                      {item.designation && (
                        <p dangerouslySetInnerHTML={{ __html: item.designation }} />
                      )}
                    </div>

                    <div className="ledrsp_right">
                      <span className="web_btn" aria-label="View Profile">
                        <ArrowIcon />
                      </span>
                    </div>
                  </div>
                </div>
                {item.slug && (
                  <Link
                    href={`${BASE_URL}leadership/${item.slug}`}
                    className="streched_link"
                    aria-label={item.name}
                  ></Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <PaginationWrapper
          currentPage={
            pageData?.meta?.current_page ?? 1
          }
          totalPages={pageData?.meta?.last_page ?? 1}
        />
      </div>
    </section>
  );
}
