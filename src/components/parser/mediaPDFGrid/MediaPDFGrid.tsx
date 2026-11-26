import Image from "next/image";
import Link from "next/link";

export default async function MediaPDFGrid({ data }: { data: any }) {
  const pageData = data[`media-pdf`] || [];

  if (pageData?.length === 0) return;

  return (
    <>
      <div className="press_grid">
        {pageData.map((item:any, idx:number)=>(
          <div key={idx} className="press_bx">
            <figure>
              <Image
                src={item?.image || '/assets/images/placeholders/news.webp'}
                alt={`Media Gallery ${item.name}`}
                className="img-fluid"
                width={406}
                height={400}
                loading="lazy"
              />
            </figure>
            <div className="bContent">
            {item?.date && (
              <span className="date">{new Date(item.date).toLocaleDateString('en-US', {year:"numeric", month:'long', day:'2-digit'})}</span>
            )}
            {item?.name && (
              <p dangerouslySetInnerHTML={{__html:item?.name}} />
            )}
            </div>
            {/* <Image src="/assets/icons/pdf_icon.webp" className="img-fluid" width={31} height={39} loading="lazy" alt="pdf icon" /> */}
            {item?.pdf && (
              <Link
                href={item.pdf}
                className="streched_link"
                target="_blank"
                aria-label={item.name}
                rel="noopener"
              ></Link>
            )}
            
          </div>
        ))}
        
      </div>
    </>
  );
}
