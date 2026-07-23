import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// Use react-pdf built-in fonts — no network dependency
// Helvetica = body, Times-Roman = headings

export interface RecipientData {
  full_name: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface PDFItemData {
  name: string;
  description: string;
  estimated_value: number | null;
  photo_url: string | null;
  primary: RecipientData | null;
  secondary: RecipientData | null;
}

export interface PDFPetData {
  name: string;
  caregiver_name: string;
  caregiver_email: string | null;
}

export interface VaultDocumentData {
  ownerName: string;
  generatedAt: string;
  items: PDFItemData[];
  pets?: PDFPetData[];
}

const TEAL = '#CF9D7B';
const INK = '#0F1C18';
const CREAM = '#F5F0E8';
const LIGHT_GRAY = '#E8E4DC';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    paddingTop: 56,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: INK,
  },

  // Header
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: TEAL,
    paddingBottom: 16,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
  },
  docTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 22,
    color: INK,
    marginBottom: 3,
  },
  headerMeta: {
    fontSize: 9,
    color: INK,
    opacity: 0.45,
  },
  vaultBrand: {
    fontFamily: 'Times-Bold',
    fontSize: 13,
    color: TEAL,
  },

  // Intent statement
  intentBox: {
    backgroundColor: CREAM,
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
    padding: 14,
    marginBottom: 28,
    borderRadius: 3,
  },
  intentText: {
    fontSize: 10,
    color: INK,
    lineHeight: 1.65,
  },

  // Section heading
  sectionHeading: {
    fontFamily: 'Times-Bold',
    fontSize: 13,
    color: INK,
    marginBottom: 12,
  },

  // Item row
  itemBlock: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 5,
    overflow: 'hidden',
  },
  itemHeader: {
    backgroundColor: CREAM,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemPhoto: {
    width: 52,
    height: 52,
    borderRadius: 4,
    objectFit: 'cover',
  },
  itemHeaderText: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    color: INK,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 9,
    color: INK,
    opacity: 0.55,
    lineHeight: 1.5,
    marginBottom: 3,
  },
  itemValue: {
    fontSize: 9,
    color: INK,
    opacity: 0.4,
  },

  // Recipients
  recipientsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  recipientCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    borderRadius: 4,
    padding: 8,
  },
  recipientLabel: {
    fontSize: 7.5,
    color: INK,
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recipientName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: INK,
    marginBottom: 1,
  },
  recipientEmail: {
    fontSize: 8.5,
    color: INK,
    opacity: 0.5,
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
  },
  statusAccepted: { backgroundColor: '#D1F5EF', color: TEAL },
  statusPending:  { backgroundColor: '#FEF3C7', color: '#D97706' },
  statusDeclined: { backgroundColor: '#FEE2DC', color: '#E8341A' },
  unassigned:     { backgroundColor: LIGHT_GRAY, color: INK, opacity: 0.4 },

  // Signature section
  signatureSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
  },
  signatureInstruction: {
    fontSize: 9,
    color: INK,
    opacity: 0.5,
    marginBottom: 32,
  },
  signatureLine: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 6,
  },
  signatureField: {
    flex: 1,
  },
  signatureUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: INK,
    height: 28,
    marginBottom: 4,
  },
  signatureFieldLabel: {
    fontSize: 8,
    color: INK,
    opacity: 0.4,
  },

  // Disclaimer
  disclaimerBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: CREAM,
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 8.5,
    color: INK,
    opacity: 0.55,
    lineHeight: 1.6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: LIGHT_GRAY,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: INK,
    opacity: 0.3,
  },
  footerBrand: {
    fontFamily: 'Times-Bold',
    fontSize: 8,
    color: TEAL,
  },
});

import type { Style } from '@react-pdf/types';

const STATUS_STYLE: Record<string, Style> = {
  accepted: styles.statusAccepted as Style,
  pending:  styles.statusPending as Style,
  declined: styles.statusDeclined as Style,
};

const STATUS_LABEL: Record<string, string> = {
  accepted: 'Accepted',
  pending:  'Pending',
  declined: 'Declined',
};

function RecipientCell({ recipient, label }: { recipient: RecipientData | null; label: string }) {
  return (
    <View style={styles.recipientCell}>
      <Text style={styles.recipientLabel}>{label}</Text>
      {recipient ? (
        <>
          <Text style={styles.recipientName}>{recipient.full_name}</Text>
          <Text style={styles.recipientEmail}>{recipient.email}</Text>
          <Text style={[styles.statusBadge, (STATUS_STYLE[recipient.status] ?? styles.unassigned) as Style]}>
            {STATUS_LABEL[recipient.status] ?? recipient.status}
          </Text>
        </>
      ) : (
        <Text style={[styles.statusBadge, styles.unassigned]}>Not assigned</Text>
      )}
    </View>
  );
}

export function VaultDocument({ data }: { data: VaultDocumentData }) {
  const formattedDate = new Date(data.generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <Document
      title="Personal Property Memorandum"
      author={data.ownerName}
      subject="Heirlo Personal Property Memorandum"
    >
      <Page size="LETTER" style={styles.page}>

        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.docTitle}>Personal Property Memorandum</Text>
            <Text style={styles.headerMeta}>
              Prepared by {data.ownerName} · Generated {formattedDate}
            </Text>
          </View>
          <Text style={styles.vaultBrand}>Heirlo</Text>
        </View>

        {/* Statement of intent */}
        <View style={styles.intentBox}>
          <Text style={styles.intentText}>
            {`I, ${data.ownerName}, intend for the personal property listed in this memorandum to be distributed to the named recipients upon my death. This document is created with testamentary intent and is intended to supplement, not replace, any will or trust I may have in effect.`}
          </Text>
        </View>

        {/* Items */}
        <Text style={styles.sectionHeading}>Assigned Items ({data.items.length})</Text>

        {data.items.map((item, i) => (
          <View key={i} style={styles.itemBlock} wrap={false}>
            <View style={styles.itemHeader}>
              {item.photo_url && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image style={styles.itemPhoto} src={item.photo_url} />
              )}
              <View style={styles.itemHeaderText}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
                {item.estimated_value != null && (
                  <Text style={styles.itemValue}>
                    Est. value: ${item.estimated_value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.recipientsRow}>
              <RecipientCell recipient={item.primary} label="Primary recipient" />
              <RecipientCell recipient={item.secondary} label="Secondary recipient" />
            </View>
          </View>
        ))}

        {data.items.length === 0 && (
          <Text style={{ fontSize: 10, color: INK, opacity: 0.4, marginBottom: 20 }}>
            No items have been assigned yet.
          </Text>
        )}

        {/* Pets */}
        {data.pets && data.pets.length > 0 && (
          <>
            <Text style={[styles.sectionHeading, { marginTop: 12 }]}>
              Assigned Pets ({data.pets.length})
            </Text>
            {data.pets.map((pet, i) => (
              <View key={i} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemHeaderText}>
                    <Text style={styles.itemName}>{pet.name}</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                  <View style={styles.recipientCell}>
                    <Text style={styles.recipientLabel}>Assigned caregiver</Text>
                    <Text style={styles.recipientName}>{pet.caregiver_name}</Text>
                    {pet.caregiver_email && (
                      <Text style={styles.recipientEmail}>{pet.caregiver_email}</Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureInstruction}>
            Sign and date below to execute this Personal Property Memorandum.
          </Text>
          <View style={styles.signatureLine}>
            <View style={styles.signatureField}>
              <View style={styles.signatureUnderline} />
              <Text style={styles.signatureFieldLabel}>Signature of {data.ownerName}</Text>
            </View>
            <View style={[styles.signatureField, { maxWidth: 140 }]}>
              <View style={styles.signatureUnderline} />
              <Text style={styles.signatureFieldLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            {`This document is a personal record of intent. It is not a substitute for legal advice. Heirlo is a documentation platform, not a law firm. Consult a licensed estate attorney in your state for legally binding estate planning.`}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Personal Property Memorandum · {data.ownerName} · {formattedDate}
          </Text>
          <Text style={styles.footerBrand}>Heirlo</Text>
        </View>

      </Page>
    </Document>
  );
}
