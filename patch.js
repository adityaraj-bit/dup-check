  // Dimension patterns: 200x180x50cm, 137x153cm
  var dimMatch3D = text.match(/ (\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|mm|in|inch|") /i);
  if(dimMatch3D) {
    sizes.push({type:'dimension',val:dimMatch3D[1]+'x'+dimMatch3D[2]+'x'+dimMatch3D[3]+dimMatch3D[4]});
  } else {
    var dimMatch=text.match(/ (\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|mm|in|inch|") /i);
    if(dimMatch) sizes.push({type:'dimension',val:dimMatch[1]+'x'+dimMatch[2]+dimMatch[3]});
  }
