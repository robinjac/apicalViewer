const el_mobileCheck = document.getElementById('mobile_check');
const btnStyle = 'width: 80px; border: 1px solid white; border-radius: 5px; background-color: rgba(224, 56, 22, 0.5); color: white; margin: 3em 0.6em';

// Check device
if(screen.availWidth > 420){
    el_mobileCheck.style.display = 'none';
    // Dynamically import the app
    import('./main.js').then();
}else{
    //import('./mobileProbe.js');
    el_mobileCheck.style.cssText = 'position: absolute; top: 25%; left: 0; width: 100%; height: 30%; border: 1px solid red; border-radius: 5px';
    el_mobileCheck.innerHTML = 
        '<center><h4 style="color: white">Your on a mobile device, would you like to contine in probe mode?</h4>' +
        `<span><button style="${btnStyle}">yes</button><button style="${btnStyle}">no</button></span></center>`;
}