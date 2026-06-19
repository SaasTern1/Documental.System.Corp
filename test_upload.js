const fs = require('fs');

async function testUpload() {
    const CLOUD_NAME = "df79cjklp";
    const UPLOAD_PRESET = "fci_documentos";
    
    // Create dummy text file
    fs.writeFileSync('dummy.txt', 'Hello World');
    
    // Node 18+ has fetch and FormData built-in, but wait, FormData from Node is slightly different if we append a file path.
    // Let's just construct a multipart/form-data request manually or use a simple buffer approach, or just use FormData with Blob.
    const blob = new Blob([fs.readFileSync('dummy.pdf')], { type: 'application/pdf' });
    
    const fd = new FormData();
    fd.append("file", blob, "dummy.pdf");
    fd.append("upload_preset", UPLOAD_PRESET);
    
    try {
        console.log("Testing /auto/upload...");
        let r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: fd });
        let d = await r.json();
        console.log("Auto upload status:", r.status);
        console.log("Auto upload response:", d);
        
        console.log("\nTesting /raw/upload...");
        r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, { method: "POST", body: fd });
        d = await r.json();
        console.log("Raw upload status:", r.status);
        console.log("Raw upload response:", d);
        
        console.log("\nTesting /image/upload...");
        r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
        d = await r.json();
        console.log("Image upload status:", r.status);
        console.log("Image upload response:", d);
    } catch(e) {
        console.error(e);
    }
}

testUpload();
