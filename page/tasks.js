function redirect(target){
    const redirectScript = localStorage.getItem('redirect.js');
    localStorage.setItem('redirect',target);
    eval(redirectScript);
}