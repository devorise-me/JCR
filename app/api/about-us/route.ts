import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
  //   const aboutUs = await db.aboutUs.findFirst({
  //     orderBy: { updatedAt: 'desc' },
  //     include: {
  //       author: {
  //         select: {
  //           FirstName: true,
  //           FamilyName: true,
  //           username: true,
  //         },
  //       },
  //     },
  //   });

    // return NextResponse.json(aboutUs);
 const aboutUs = {
     content: "This is temporary content.",
      author: { name: "Admin" },
      updatedAt: new Date()
 };
  // 
  } catch (error) {
    console.error('Error fetching about us:', error);
    return NextResponse.json({ error: 'Failed to fetch about us' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, authorId, isRTL, fontSize, textAlign } = await req.json();
    
    if (!content || !authorId) {
      return NextResponse.json({ error: 'Missing required fields: content, authorId' }, { status: 400 });
    }

    // Verify the author exists and has permission
    // const author = await db.user.findUnique({
    //   where: { id: authorId },
    //   select: { role: true },
    // });

    // if (!author || (author.role !== 'ADMIN' && author.role !== 'SUPERVISOR')) {
      // return NextResponse.json({ error: 'Unauthorized to update about us' }, { status: 403 });
    // }

    // Delete existing about us content (since we only want one)
    // await db.aboutUs.deleteMany({});

    // const aboutUs = await db.aboutUs.create({
    //   data: {
    //     content,
    //     authorId,
    //     isRTL: isRTL !== undefined ? isRTL : true,
    //     fontSize: fontSize || 'medium',
    //     textAlign: textAlign || 'right',
    //   },
    //   include: {
    //     author: {
    //       select: {
    //         FirstName: true,
    //         FamilyName: true,
    //         username: true,
    //       },
    //     },
    //   },
    // });

    // Log the action
    // await db.adminActivity.create({
      // data: {
        // userId: authorId,
        // action: "تحديث صفحة من نحن",
        // details: "تم تحديث محتوى صفحة من نحن",
        // timestamp: new Date(),
      // },
    // });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating about us:', error);
    return NextResponse.json({ error: 'Failed to create/update about us' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { content, authorId, isRTL, fontSize, textAlign } = await req.json();
    
    if (!content || !authorId) {
      return NextResponse.json({ error: 'Missing required fields: content, authorId' }, { status: 400 });
    }

    // Verify the author exists and has permission
    const author = await db.user.findUnique({
      where: { id: authorId },
      select: { role: true },
    });

    if (!author || (author.role !== 'ADMIN' && author.role !== 'SUPERVISOR')) {
      return NextResponse.json({ error: 'Unauthorized to update about us' }, { status: 403 });
    }

    // Find existing about us
    // const existing = await db.aboutUs.findFirst();

        // let aboutUs;
        // if (existing) {
        //   aboutUs = await db.aboutUs.update({
        //     where: { id: existing.id },
        //     data: {
        //       content,
        //       authorId,
        //       isRTL: isRTL !== undefined ? isRTL : true,
        //       fontSize: fontSize || 'medium',
        //       textAlign: textAlign || 'right',
        //       updatedAt: new Date(),
        //     },
        //     include: {
        //       author: {
        //         select: {
        //           FirstName: true,
        //           FamilyName: true,
        //           username: true,
        //         },
        //       },
        //     },
        //   });
        // } else {
        //   aboutUs = await db.aboutUs.create({
        //     data: {
        //       content,
        //       authorId,
        //       isRTL: isRTL !== undefined ? isRTL : true,
        //       fontSize: fontSize || 'medium',
        //       textAlign: textAlign || 'right',
        //     },
        //     include: {
        //       author: {
        //         select: {
        //           FirstName: true,
        //           FamilyName: true,
        //           username: true,
        //         },
        //       },
        //     },
        //   });
        // }
    // const existing = await db.aboutUs.findFirst();  
    // Log the action

const session = await auth();
const sessionAuthorId = session?.user?.id;

// ... later in the code ...

// FIX: Add this check right before creating the activity log
if (!sessionAuthorId) {
  // If for some reason there is no authorId, log an error and stop.
  console.error("Cannot log admin activity: authorId is missing.");
  // You might want to return an error response here as well.
  return new NextResponse("Authentication error: User ID not found.", { status: 401 });
}
    await db.adminActivity.create({
      data: {
        userId: sessionAuthorId,
        action: "تحديث صفحة من نحن",
        details: "تم تحديث محتوى صفحة من نحن",
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ message: 'About us updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating about us:', error);
    return NextResponse.json({ error: 'Failed to update about us' }, { status: 500 });
  }
}

