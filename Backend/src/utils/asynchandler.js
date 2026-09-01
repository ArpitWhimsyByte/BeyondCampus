const asynchandler=(requestHandler)=> async (req,res,next)=>{
    try {
        await requestHandler(req,res,next)
    } catch (error) {
        console.log("ERROR : ",error)
        next(error);
    }
}

export {asynchandler}