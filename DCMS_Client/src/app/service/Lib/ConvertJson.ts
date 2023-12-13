export class ConvertJson{
   static formatAndParse(input: string): any {
    return JSON.parse(
      input
        .replace(/=/g, ':')
        .replace(/(\w+)(?=:)/g, '"$1"')
        .replace(/=|:/g, ':')
        .replace(/:([^",\}\s]+)(?=[,\}])/g, ':"$1"')
        .replace(/:([^"\d\[\]{},]+)(?=[,\}])/g, ':"$1"')
        .replace(/:(\s*),/g, ': "",')
    );
  }

   static decodeEscapedUnicode(input: string): string {
    // const regex = /\\u([\d\w]{4})/gi;
    // return input.replace(regex, (match, grp) => {
    //   return String.fromCharCode(parseInt(grp, 16));
    // });

    return input.replace(/\\u([\dA-F]{4})/gi, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
  }
   static processApiResponse(textData: string): any {
    const detailsPattern = /"details": (\[\{[^\[]+?\}\])/g;
    const formattedData = textData
      .replace(/:\s*,/g, ': "",')
      .replace(detailsPattern, (match, innerMatch) => {
        const modified = this.formatAndParse(this.decodeEscapedUnicode(innerMatch));
        return '"details": ' + JSON.stringify(modified);
      });
    return JSON.parse(formattedData);
  }
} 
