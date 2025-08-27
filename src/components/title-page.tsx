import React, { type ReactNode } from "react";

export default function TitlePage({ 
  title, 
  description,
  className, 
  children 
}: { 
  title?: string,
  description?: string,
  className?: string,
  children?: ReactNode
}) {
    return (
        <div className={className || ''}>
            <h1 className="text-2xl font-bold">
                {title || children}
            </h1>
            {description && (
                <p className="text-muted-foreground mt-2">
                    {description}
                </p>
            )}
        </div>
    )
}