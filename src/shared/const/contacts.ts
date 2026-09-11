import { DEFAULT_CONTENT } from '@/shared/content/defaults'

/**
 * Default contacts, sourced from the CMS defaults. This is the *fallback* /
 * build-time value — anything rendered on the client that must reflect live
 * admin edits receives contacts via props from a server component that calls
 * `getSiteContent()`. Kept for backward compatibility and static usage.
 */
export const CONTACTS = DEFAULT_CONTENT.contacts
