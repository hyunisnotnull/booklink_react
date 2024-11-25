export const cleanHTMLText = (text) => {
    // HTML 디코딩을 위해 textarea 활용
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text || '';
    return textArea.value.replace(/<[^>]*>/g, '').replace(/&lt;|&gt;/g, '').trim();
  };
  
  export const cleanBookName = (name) => {
    // ':' 뒤 내용 제거 및 '()' 패턴 제거
    return name?.replace(/\s*:.*/, '').replace(/^\(.*?\)\s*/, '').trim();
  };

  export const extractAuthors = (authors) => {
    // 저자 정보만 추출
    return authors
      ?.split(';')
      .map((author) => 
        author
        .replace(/^(저자:|지은이:|글:|지음|글·그림:)\s*/, '')
        .replace(/그림[:\s].*/, '')
        .trim()
      )
      .filter((author) => !/옮긴이[:\s]|옮김/.test(author))
      .join(', ')
      .replace(/,\s*$/, '');;
  };
  
  export const extractTranslator = (authors) => {
    // 옮긴이 정보 추출
    return authors
      ?.split(/[,;]/)
      .find((author) => /옮긴이[:\s]|옮김/.test(author))
      ?.replace(/옮긴이[:\s]*|옮김/, '')
      .trim();
  };