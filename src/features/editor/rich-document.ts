import type {JSONContent} from '@tiptap/core'

// The stored text contract stays compatible; syntax never enters the editable DOM.
export function readInline(text:string,marks:NonNullable<JSONContent['marks']>=[],depth=0):JSONContent[]{
 if(depth>8)return text?[{type:'text',text,marks}]:[]
 const pattern=/\\\(([\s\S]*?)\\\)|\*\*([\s\S]+?)\*\*(?!\*)|\*([^*\n]+)\*|~\{([^{}]+)\}|\^\{([^{}]+)\}/g
 const content:JSONContent[]=[];let cursor=0
 const plain=(value:string)=>{value.split('\n').forEach((line,index)=>{if(index)content.push({type:'hardBreak'});if(line)content.push({type:'text',text:line,marks})})}
 for(const match of text.matchAll(pattern)){
  plain(text.slice(cursor,match.index));const [whole,math,bold,italic,sub,sup]=match
  if(math!==undefined)content.push({type:'equation',attrs:{latex:math},marks})
  else{const type=bold!==undefined?'bold':italic!==undefined?'italic':sub!==undefined?'subscript':'superscript';content.push(...readInline(bold??italic??sub??sup,[...marks,{type}],depth+1))}
  cursor=match.index+whole.length
 }
 plain(text.slice(cursor));return content
}
export function readDocument(text:string):JSONContent{return {type:'doc',content:[{type:'paragraph',content:readInline(text)}]}}
const delimiters:Record<string,[string,string]>={bold:['**','**'],italic:['*','*'],subscript:['~{','}'],superscript:['^{','}']}
function writeInline(nodes:JSONContent[]):string{
 let result=''
 for(let index=0;index<nodes.length;){
  const node=nodes[index],mark=node.marks?.find(m=>delimiters[m.type])
  if(mark){
   const group:JSONContent[]=[]
   while(index<nodes.length&&nodes[index].marks?.some(m=>m.type===mark.type)){const next=nodes[index++];group.push({...next,marks:next.marks?.filter(m=>m.type!==mark.type)})}
   const [before,after]=delimiters[mark.type];result+=before+writeInline(group)+after
  }else{result+=node.type==='equation'?`\\(${node.attrs?.latex??''}\\)`:node.type==='hardBreak'?'\n':node.text??'';index++}
 }
 return result
}
export function writeDocument(doc:JSONContent):string{return (doc.content??[]).map(node=>writeInline(node.content??[])).join('\n')}
