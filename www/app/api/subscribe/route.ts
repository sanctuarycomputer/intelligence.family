import { NextRequest, NextResponse } from 'next/server';

interface SubscribeResponse {
  success: boolean;
  message: string;
  status: 'subscribed' | 'already_subscribed' | 'error';
}

export async function POST(request: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  try {
    const body = await request.json();
    const { email, source } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Email address is required.',
          status: 'error',
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please enter a valid email address.',
          status: 'error',
        },
        { status: 400 }
      );
    }

    // Only allow known source tags so callers can't pollute the CRM
    const ALLOWED_SOURCES = ['g3d:family_intelligence', 'g3d:family_intelligence:fundraising'];
    const resolvedSource = typeof source === 'string' && ALLOWED_SOURCES.includes(source)
      ? source
      : 'g3d:family_intelligence';

    const normalizedEmail = email.toLowerCase().trim();

    // // FOR DEBUGGING ONLY
    // console.log('appended email:', normalizedEmail);
    // return NextResponse.json(
    //   {
    //     success: true,
    //     message: 'Thank you for subscribing! We\'ll keep you updated.',
    //     status: 'subscribed',
    //   },
    //   { status: 201 }
    // );

    const response = await fetch('https://stacks.garden3d.net/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.STACKS_API_KEY!,
      },
      body: JSON.stringify({
        email: normalizedEmail,
        sources: [resolvedSource]
      }),
    });

    if (response.ok) {
      return NextResponse.json(
        {
          success: true,
          message: 'Thank you for subscribing! We\'ll keep you updated.',
          status: 'subscribed',
        },
        { status: 201 }
      );
    } else {
      console.error('Subscription error:', response.statusText);
      return NextResponse.json(
        {
          success: false,
          message: 'Something went wrong. Please try again later.',
          status: 'error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Subscription error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again later.',
        status: 'error',
      },
      { status: 500 }
    );
  }
}