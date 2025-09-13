'use client'

import { ReactNode, useId } from 'react'

interface AccordionProps {
	children: ReactNode
	className?: string
}

interface AccordionItemProps {
	title: ReactNode
	children: ReactNode
	defaultOpen?: boolean
	id?: string
}

export function Accordion({ children, className = '' }: AccordionProps) {
	return (
		<div className={`divide-y divide-gray-200 ${className}`} role="tablist" aria-multiselectable="true">
			{children}
		</div>
	)
}

export function AccordionItem({ title, children, defaultOpen = false, id }: AccordionItemProps) {
	const generatedId = useId()
	const itemId = id || generatedId

	return (
		<details className="group" open={defaultOpen}>
			<summary
				role="tab"
				aria-controls={`${itemId}-content`}
				className="cursor-pointer list-none select-none flex items-center justify-between py-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
			>
				<div className="text-base font-semibold text-gray-900">{title}</div>
				<span
					aria-hidden="true"
					className="ml-4 h-5 w-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 group-open:rotate-180 transition-transform"
				>
					▾
				</span>
			</summary>
			<div id={`${itemId}-content`} role="tabpanel" className="pb-3">
				{children}
			</div>
		</details>
	)
}


