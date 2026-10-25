import multer from 'multer'


const storage = multer.memoryStorage()

const fileFilter = (req , file , cb) => {
    const isPdfExtension = file.originalname.toLowerCase().endsWith('.pdf')

    const isPdfMime = file.mimetype ==='application/pdf'

    if(isPdfExtension && isPdfMime) {
        cb(null , true)
    }else{
        cb (new Error('Only PDF files are allowed'),false)
    }
}

export const uploadResume = multer({
    storage , 
    limits:{
        fileSize: 5 * 1024 * 1024 ,
        files: 1
    },
    fileFilter 
}).single('resume')