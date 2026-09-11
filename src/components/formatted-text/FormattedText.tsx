import {useMemo,type ReactNode} from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './formatted-text.css'
/** Only these explicit inline delimiters are interpreted. Raw HTML remains React text. */
export function formattedNodes(text:string,depth=0):ReactNode{
 if(depth>8)return text
 const pattern=/\\\(([\s\S]*?)\\\)|\*\*([\s\S]+?)\*\*(?!\*)|\*([^*\n]+)\*|~\{([^{}]+)\}|\^\{([^{}]+)\}/g
 const nodes:ReactNode[]=[];let cursor=0
 for(const match of text.matchAll(pattern)){
  if(match.index>cursor)nodes.push(text.slice(cursor,match.index))
  const [whole,math,bold,italic,sub,sup]=match,key=match.index
  if(math!==undefined){let html:string;try{html=katex.renderToString(math,{throwOnError:true,trust:false,strict:'error',maxExpand:100,maxSize:10,output:'htmlAndMathml'})}catch{nodes.push(<span key={key} dir="ltr">{math}</span>);cursor=key+whole.length;continue}
   // Only KaTeX output enters HTML; teacher input never does. trust=false forbids URLs, images and HTML commands.
   nodes.push(<span key={key} className="asasera-equation" data-equation-offset={key} dir="ltr" dangerouslySetInnerHTML={{__html:html}}/>)
  }else if(bold!==undefined)nodes.push(<strong key={key}>{formattedNodes(bold,depth+1)}</strong>)
  else if(italic!==undefined)nodes.push(<em key={key}>{formattedNodes(italic,depth+1)}</em>)
  else if(sub!==undefined)nodes.push(<sub key={key}>{sub}</sub>)
  else nodes.push(<sup key={key}>{sup}</sup>)
  cursor=key+whole.length
 }
 nodes.push(text.slice(cursor));return nodes
}
export function FormattedText({text}:{text:string}){const content=useMemo(()=>formattedNodes(text),[text]);return <span className="asasera-formatted-text">{content}</span>}
export function plainFormattedText(text:string){return text.replace(/\*\*([^*]+)\*\*|\*([^*\n]+)\*|[~^]\{([^{}]+)\}|\\\(([\s\S]*?)\\\)/g,(_,b,i,s,m)=>b??i??s??m)}
