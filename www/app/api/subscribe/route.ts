import { NextRequest, NextResponse } from 'next/server';

interface SubscribeResponse {
  success: boolean;
  message: string;
  status: 'subscribed' | 'already_subscribed' | 'error';
}

function appendTimestampToEmail(email: string): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomChars = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const suffix = `${date}.${randomChars}`;
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;
  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  return `${localPart}+${suffix}${domain}`;
}

export async function POST(request: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  try {
    const body = await request.json();
    const { email, appendTimestamp } = body;

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

    let normalizedEmail = email.toLowerCase().trim();

    // Append timestamp if requested (for email gate modal)
    if (appendTimestamp) {
      normalizedEmail = appendTimestampToEmail(normalizedEmail);
    }

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
        sources: ['g3d:family_intelligence']
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