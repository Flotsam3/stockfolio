import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { validateRegistrationInput } from '@/libs/authValidation';
import { connectDB } from '@/libs/connectDB';
import User from '@/models/User';

type MongoDuplicateError = {
  code?: number;
};

export async function POST(request: Request) {
  try {
    const input = await request.json().catch(() => null);
    const validation = validateRegistrationInput(input);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Connect to MongoDB
    await connectDB();
    
    // Check if user exists
    const existingUser = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: { 
          id: user._id, 
          email: user.email, 
          name: user.name 
        }
      },
      { status: 201 }
    );

  } catch (error) {
    if ((error as MongoDuplicateError)?.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    console.error('Registration failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
