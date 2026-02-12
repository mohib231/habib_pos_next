// import connectDB from "@/lib/connectDB";
// import User from "@/model/users.model";
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";


// export async function POST(request: NextRequest) {
//     try {
//       await connectDB();
//     const { email,username, password } = await request.json();
//     const existingUser = await User.findOne({ $or: [ { email }, { username } ] });
//     if (existingUser) {
//         return NextResponse.json({success:false,message:'User with this email or username already exists'}, {status:400});
//     }
//     const newUser = new User({ email,username, password });
//     await newUser.save();
//     return NextResponse.json({success:true,message:'User registered successfully'}, {status:201});
//     }catch(error){
//         console.error('error registring user:', error);
//         return NextResponse.json({success:false,message:'Internal Server Error'}, {status:500});

//     }
// }