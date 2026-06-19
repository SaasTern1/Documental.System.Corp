// Utilities to normalize text and fix common mojibake sequences and emoji placeholders
(function(){
  window.normalizeText = function(s){
    if (s === null || s === undefined) return '';
    try { s = String(s); } catch(e){ return '' }
    try { if (s.normalize) s = s.normalize('NFC'); } catch(e){}

    const fixes = {
      // Common mojibake sequences -> correct characters
      'Ã¡':'á','Ã©':'é','Ã­':'í','Ã³':'ó','Ãº':'ú','Ã±':'ñ','Ã‘':'Ñ','Ã‰':'É','Ã“':'Ó','Ãš':'Ú','Ã‘':'Ñ',
      'â€™':'’','â€˜':'‘','â€œ':'“','âu00A0':' ', 'Â':'',
      // Common UTF-8 mis-decodings for emojis seen in repo
      'ðŸ”':'🔍','ðŸ’¬':'💬','ðŸ–':'✏️','ðŸ‘':'👍','ðŸ˜':'😃','Ã°ÂŸ':'',
      '\uFFFD':'', // replacement char
    };

    // Replace all keys occurrences
    const re = new RegExp(Object.keys(fixes).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
    s = s.replace(re, m => fixes[m] || m);

    // Trim stray control characters but keep unicode letters and emojis
    s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');

    return s;
  };

  window.normalizeHtmlString = function(html){
    if (!html) return html;
    try{
      const tpl = document.createElement('template');
      tpl.innerHTML = html;
      const walk = (node) => {
        node.childNodes.forEach(child => {
          if(child.nodeType === Node.TEXT_NODE){
            child.nodeValue = window.normalizeText(child.nodeValue);
          } else if(child.nodeType === Node.ELEMENT_NODE){
            walk(child);
          }
        });
      };
      walk(tpl.content);
      return tpl.innerHTML;
    } catch(e){
      return html;
    }
  };

  // Small helper to normalize values from inputs before usage
  window.normalizeInputValue = function(v){ return window.normalizeText(v); };

})();
