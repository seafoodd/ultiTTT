import { useEffect } from "react"

type Protocol = "https" | "http"
type Url<P extends Protocol = 'http'> = `${P}://${string}`
type PublicPath = `/${string}`

type ImageType = Url | PublicPath

interface Opengraph extends Pick<Metadata, "title" | "description"> {
  image: ImageType
}

interface Metadata {
  title?: string
  description?: string
  icon?: ImageType
  opengraph?: Opengraph
}

function setMetaTag(name: string, content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let meta = document.head.querySelector<HTMLMetaElement>(selector)

  if (!meta) {
    meta = document.createElement("meta")
    if (isProperty) {
      meta.setAttribute("property", name)
    } else {
      meta.setAttribute("name", name)
    }
    document.head.appendChild(meta)
  }

  meta.setAttribute("content", content)
}

export function useClientSeo(metadata: Metadata) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (metadata.title) {
      document.title = metadata.title
      setMetaTag("og:title", metadata.title, true)
    }

    if (metadata.description) {
      setMetaTag("description", metadata.description)
      !metadata.opengraph?.description && setMetaTag("og:description", metadata.description, true)
    }

    if (metadata.opengraph?.description) {
      setMetaTag("og:description", metadata.opengraph.description, true)
    }

    if (metadata.opengraph?.image) {
      setMetaTag("og:image", metadata.opengraph.image, true)
    }

    if (metadata.icon) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement("link")
        link.rel = "icon"
        document.head.appendChild(link)
      }
      link.href = metadata.icon
    }

  }, [metadata])
}
