function compare( a, b ) {
  if ( a.y < b.y ){
    return -1;
  }
  if ( a.y > b.y ){
    return 1;
  }
  return 0;
}
