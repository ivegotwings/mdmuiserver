//equivelant of String.Format of C#, printf of C/PHP

// there are more versions of this implementation here: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function () {
        let content = this;
        for (let i = 0; i < arguments.length; i++) {
            let replacement = '{' + i + '}';
            content = content.replace(replacement, arguments[i]);
        }
        return content;
    };
} else {
    //if String.format is already defined then what?
}

//equivelant of String.hashCode of Java
//taken from: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
if (!String.prototype.hashCode) {
    String.prototype.hashCode = function () {
        let hash = 0;
        if (this.length == 0) return hash;
        for (let i = 0; i < this.length; i++) {
            let char = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash;
    }
}