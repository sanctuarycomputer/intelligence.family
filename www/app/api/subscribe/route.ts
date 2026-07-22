import { NextRequest, NextResponse } from 'next/server';
import { createCrmContact } from '@/lib/crm';

interface SubscribeResponse {
  success: boolean;
  message: string;
  status: 'subscribed' | 'already_subscribed' | 'error';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: NextRequest
): Promise<NextResponse<SubscribeResponse>> {
  try {
    const { email, source } = await request.json();

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please enter a valid email address.',
          status: 'error',
        },
        { status: 400 }
      );
    }

    const result = await createCrmContact(
      email.trim(),
      typeof source === 'string' ? source : undefined
    );

    if (result.ok) {
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for subscribing! We'll keep you updated.",
          status: 'subscribed',
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again later.',
        status: 'error',
      },
      { status: 500 }
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
