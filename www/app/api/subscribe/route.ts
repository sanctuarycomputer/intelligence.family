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

    // Check if already subscribed
    if (subscribedEmails.has(normalizedEmail)) {
      return NextResponse.json(
        {
          success: true,
          message: 'This email is already subscribed to our updates.',
          status: 'already_subscribed',
        },
        { status: 200 }
      );
    }

    // Add to subscribers (in production, save to database/email service)
    subscribedEmails.add(normalizedEmail);

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing! We\'ll keep you updated.',
        status: 'subscribed',
      },
      { status: 201 }
    );

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

// GET endpoint to check subscription status (optional utility)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isSubscribed = subscribedEmails.has(normalizedEmail);

  return NextResponse.json({
    email: normalizedEmail,
    subscribed: isSubscribed,
  });
}

