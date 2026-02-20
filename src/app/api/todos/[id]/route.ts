import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const todoId = parseInt(id, 10);
  if (isNaN(todoId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const data: { title?: string; completed?: boolean } = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = title;
  }

  if (typeof body.completed === "boolean") {
    data.completed = body.completed;
  }

  const todo = await prisma.todo.update({
    where: { id: todoId },
    data,
  });

  return NextResponse.json(todo);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const todoId = parseInt(id, 10);
  if (isNaN(todoId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.todo.delete({ where: { id: todoId } });

  return new NextResponse(null, { status: 204 });
}
