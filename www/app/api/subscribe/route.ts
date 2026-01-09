import { NextRequest, NextResponse } from 'next/server';

// Example in-memory store for demonstration
// In production, you'd use a real database or email service like Mailchimp, ConvertKit, etc.
const subscribedEmails = new Set<string>([
  'already@subscribed.com', // Example of already subscribed email for testing
]);

interface SubscribeResponse {
  success: boolean;
  message: string;
  status: 'subscribed' | 'already_subscribed' | 'error';
}

export async function POST(request: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  try {
    const body = await request.json();
    const { email } = body;

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

    const normalizedEmail = email.toLowerCase().trim();

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