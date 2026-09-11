// Which way a field should read while it is still empty, and while the browser's
// own dir="auto" has nothing to go on. dir="auto" falls back to ltr when the value
// holds no strong character, which left Arabic placeholders and the caret on the
// wrong edge of every authoring field. We resolve the first strong letter ourselves
// and fall back to the interface language instead.
const RTL_SCRIPT=/[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Adlam}]/u
const LETTER=/\p{L}/u

// Stored authoring text carries inline syntax (**bold**, ~{sub}, \(latex\)) that is
// not the author's wording; latex is Latin and would otherwise decide the direction.
function wording(text:string):string{return text.replace(/\\\([\s\S]*?\\\)/g,'').replace(/\*\*|[*~^]|[{}]/g,'')}

export function firstStrongDirection(text:string):'rtl'|'ltr'|null{
 for(const character of wording(text)){
  if(!LETTER.test(character))continue
  return RTL_SCRIPT.test(character)?'rtl':'ltr'
 }
 return null
}

/** The direction to write on a field: the author's own text when it has any, otherwise the interface language. */
export function authoringDirection(text:string,arabicInterface:boolean):'rtl'|'ltr'{
 return firstStrongDirection(text)??(arabicInterface?'rtl':'ltr')
}
