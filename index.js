
let input_preview = document.getElementById("input-preview");
let ascii_output = document.getElementById("ascii-output");
let input_canvas = document.getElementById("input-canvas");
let output_canvas = document.getElementById("output-canvas");

// https://paulbourke.net/dataformats/asciiart/
let asciiList = "@%#*+=-:."
// let asciiList = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`;

let file_option = {
    multiple: false,
    types: [{
        description: "image/video",
        accept:{
            "image/*": [],
            "video/*": [],
        },
    },]
}

let media_content;
let timer;
let livestream;
let resize_ratio = 1;
let max_resize_px = 300;
// max_resize_px = parseInt(window.innerWidth*0.3)>max_resize_px?max_resize_px:parseInt(window.innerWidth*0.3);

const clearContents = () => {
    if (timer) {
        clearTimeout(timer);
    }
    if (livestream) {
        cancelAnimationFrame(livestream)
    }
    input_preview.innerHTML = "";
    ascii_output.innerHTML = "";
}

const load = async () => {
    try {
        let [file_handle] = await window.showOpenFilePicker(file_option);
        let file = await file_handle.getFile();
        media_content = URL.createObjectURL(file);  // Create a URL for the file
        console.log(file.type);
        
        clearContents();
        if (file.type=="image/gif") {
            gifToASCII(media_content);
        }
        else if (file.type.includes("image")) {
            imageToASCII(media_content);
        }
        else if (file.type.includes("video")) {
            videoToASCII(media_content,file.type);
        }
        // pixelToASCII(media_content);
    }
    catch(err) {
        console.error("upload error:",err);
        // pixelToASCII();
    }
}

const camera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Access the user's camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            // Create a video element to display the camera feed
            let video = document.createElement('video');
            video.setAttribute("id","input-video");
            video.srcObject = stream;  // Use srcObject for streams
            video.style.transform = "scaleX(-1)";
            let preview_canvas = document.createElement("canvas");
            let preview_ctx = input_ctx = preview_canvas.getContext('2d');
            video.onloadedmetadata = () => {
                // resize the input
                let width = video.videoWidth;
                let height = video.videoHeight;
                let resize_px = Math.round(width*resize_ratio);
                resize_px = resize_px>max_resize_px?max_resize_px:resize_px;
                if (width > resize_px) {
                    const division = resize_px/width;
                    width = resize_px;
                    height = height * division;
                }
                preview_canvas.width = width;
                preview_canvas.height = height;

                input_canvas.width = width;
                input_canvas.height = height;
                
                output_canvas.width = width;
                output_canvas.height = height;

                function captureFrame(){
                    preview_ctx.setTransform(-1, 0, 0, 1, preview_canvas.width, 0);; //horizontal flip ctx
                    preview_ctx.drawImage(video, 0, 0, preview_canvas.width, preview_canvas.height);
                    preview_ctx.drawImage(video, 0, 0, preview_canvas.width, preview_canvas.height);
              
                    // Get the ImageData from the canvas
                    const imageData = preview_ctx.getImageData(0, 0, preview_canvas.width, preview_canvas.height);
                    const input_ctx = input_canvas.getContext('2d');
                    input_ctx.putImageData(imageData,0,0);
              
                    // You can now use the imageData for your needs (e.g., pixel manipulation, etc.)
                    // console.log(imageData);
                    ascii_output.innerText = pixelToASCII(imageData.data,preview_canvas.width);
                    const output_ctx = output_canvas.getContext('2d');
                    output_ctx.putImageData(imageData,0,0);
              
                    // Call captureFrame again using requestAnimationFrame for smoother updates
                    livestream = requestAnimationFrame(captureFrame);
                }
                // Start capturing frames
                captureFrame();
            };
            video.autoplay = true;      // Start playing the video automatically
            video.playsInline = true;   // Ensure video plays inline on mobile devices
            // Append the video element to the DOM
            if (input_preview) {
                clearContents();
                input_preview.appendChild(preview_canvas);
            } else {
                console.log("Error: Element with id 'input-preview' not found.");
                alert("Error: Element with id 'input-preview' not found.");
            }
        } catch (error) {
            console.error('Error accessing the camera:', error);
            alert(`Error accessing the camera: ${error}`);
        }
    } else {
        console.log('Camera access not supported on this browser.');
        alert('Camera access not supported on this browser.');
    }
}

const videoToASCII = (link="videos/5201403-hd_1080_1920_30fps.mp4",type="video/mp4") => {
    try {
        // Create a video element to display the camera feed
        let video = document.createElement('video');
        let source = document.createElement('source');
        video.setAttribute("id","input-video");
        // video.src = link; 
        source.setAttribute("src",link);
        source.setAttribute('type',type);
        video.appendChild(source);
        let preview_canvas = document.createElement("canvas");
        let preview_ctx = input_ctx = preview_canvas.getContext('2d');
        video.onloadedmetadata = () => {
            // resize the input
            let width = video.videoWidth;
            let height = video.videoHeight;
            let resize_px = Math.round(width*resize_ratio);
            resize_px = resize_px>max_resize_px?max_resize_px:resize_px;
            if (width > resize_px) {
                const division = resize_px/width;
                width = resize_px;
                height = height * division;
            }
            preview_canvas.width = width;
            preview_canvas.height = height;

            input_canvas.width = width;
            input_canvas.height = height;
            
            output_canvas.width = width;
            output_canvas.height = height;

            function captureFrame(){
                preview_ctx.setTransform(-1, 0, 0, 1, preview_canvas.width, 0);; //horizontal flip ctx
                preview_ctx.drawImage(video, 0, 0, preview_canvas.width, preview_canvas.height);
                preview_ctx.drawImage(video, 0, 0, preview_canvas.width, preview_canvas.height);
          
                // Get the ImageData from the canvas
                const imageData = preview_ctx.getImageData(0, 0, preview_canvas.width, preview_canvas.height);
                const input_ctx = input_canvas.getContext('2d');
                input_ctx.putImageData(imageData,0,0);
          
                // You can now use the imageData for your needs (e.g., pixel manipulation, etc.)
                // console.log(imageData);
                ascii_output.innerText = pixelToASCII(imageData.data,preview_canvas.width);
                const output_ctx = output_canvas.getContext('2d');
                output_ctx.putImageData(imageData,0,0);
          
                // Call captureFrame again using requestAnimationFrame for smoother updates
                livestream = requestAnimationFrame(captureFrame);
            }
            // Start capturing frames
            captureFrame();
        };
        video.autoplay = true;      // Start playing the video automatically
        video.playsInline = true;   // Ensure video plays inline on mobile devices
        video.loop = true;
        // Append the video element to the DOM
        if (input_preview) {
            clearContents();
            input_preview.appendChild(preview_canvas);
            // input_preview.appendChild(video)
        } else {
            console.log("Error: Element with id 'input-preview' not found.");
            alert("Error: Element with id 'input-preview' not found.");
        }
    } catch (error) {
        console.error('Error accessing the camera:', error);
        alert(`Error accessing the camera: ${error}`);
    }
}


const imageToASCII = (link="images/capybara-orange.png") => {
    // get the input source
    let image = new Image();
    image.setAttribute("id","input-source-media");
    image.src = link;
    image.onload = () => {
        //resize so that it still looks ok
        let width = image.width;
        let height = image.height;
        let resize_px = Math.round(width*resize_ratio);
        resize_px = resize_px>max_resize_px?max_resize_px:resize_px;
        if (width > resize_px) {
            const division = resize_px/width;
            width = resize_px;
            height = height * division;
        }

        image.width = width;
        image.height = height;

        input_canvas.width = width;
        input_canvas.height = height

        output_canvas.width = width;
        output_canvas.height = height;

        let input_ctx = input_canvas.getContext('2d');
        input_ctx.drawImage(image,0,0,width,height);
        input_preview.innerHTML = "";
        input_preview.appendChild(image);

        const image_data = input_ctx.getImageData(0,0,width,height)
        const pixel_data = image_data.data;
        // console.log(image_data);
        // console.log(pixel_data);
        // console.log(pixel_data.length/4); // r,g,b,a (alpha is transparency);
        ascii_output.innerText = pixelToASCII(pixel_data, width);

        // convert it to ascii
        // show to output
        const output_ctx = output_canvas.getContext('2d');
        output_ctx.putImageData(image_data,0,0);
    }
}


const gifToASCII = (link="gifs/squirtle-saxaphone.gif") => {
    gifFrames({ url: link, frames: "all" , outputType: "canvas"}).then(function (frameData) {
        const total_frame = frameData.length;
        let current_frame = 0;

        function drawFrame(idx=0) {
            let input_ctx = input_canvas.getContext('2d');

            let frame_canvas = frameData[idx].getImage();
            
            let resized_image = new Image();
            resized_image.src = frame_canvas.toDataURL();
            resized_image.onload = () => {
                let width = resized_image.width;
                let height = resized_image.height;
                let resize_px = Math.round(width*resize_ratio);
                resize_px = resize_px>max_resize_px?max_resize_px:resize_px;
                if (width > resize_px) {
                    const division = resize_px/width;
                    width = resize_px;
                    height = height * division;
                }
                resized_image.width = width;
                resized_image.height = height;
            
                input_canvas.width = width;
                input_canvas.height = height
        
                output_canvas.width = width;
                output_canvas.height = height;
                
                input_ctx.drawImage(resized_image,0,0,width,height);
                let resized_image_data = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height);
    
                document.getElementById("input-preview").innerHTML = "";
                document.getElementById("input-preview").appendChild(resized_image);
                ascii_output.innerText = pixelToASCII(resized_image_data.data,width);
                const output_ctx = output_canvas.getContext('2d');
                output_ctx.putImageData(resized_image_data,0,0);
            }

            timer = setTimeout(()=>{
                if (current_frame>=(total_frame-1)) {
                    current_frame = 0;
                }
                else {
                    current_frame += 1;
                }
                drawFrame(current_frame);
            },frameData[current_frame].frameInfo.delay*10);
        }
        drawFrame(current_frame); //initial trigger
    });
}

const pixelToASCII = (pixel_data = [], width=0) => {
    let ascii_content = "";
    for (let i=0; i<pixel_data.length; i+=4) {
        // let gray_px = 0.299*pixel_data[i] + 0.587*pixel_data[i+1] + 0.114*pixel_data[i+2];
        let gray_px = 0.2126*pixel_data[i] + 0.7152*pixel_data[i+1] + 0.0722*pixel_data[i+2];

        if (pixel_data[i+3] == 0) { //transparent background
            gray_px = 255;
        }

        pixel_data[i] = gray_px;
        pixel_data[i+1] = gray_px;
        pixel_data[i+2] = gray_px;

        //binning 0-255 to asciiList.length
        if (parseInt(i/4)%(width) == 0 && i!=0) {
            ascii_content += "\n";
        }
        ascii_content += asciiList[Math.round(gray_px/255*(asciiList.length-1))];
    }
    return ascii_content;
}

// imageToASCII();
// gifToASCII();
// videoToASCII();
document.getElementById("load-button").addEventListener("click", load);
document.getElementById("camera-button").addEventListener("click", camera)

