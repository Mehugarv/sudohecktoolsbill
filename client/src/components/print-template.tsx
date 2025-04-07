import React from "react";

export default function PrintTemplate() {
  return (
    <div id="print-template" className="hidden">
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 id="print-shop-name" className="text-2xl font-bold"></h1>
          <p id="print-shop-address" className="text-sm"></p>
          <p id="print-shop-contact" className="text-sm"></p>
          <p id="print-shop-gst" className="text-xs text-slate-500"></p>
        </div>
        
        <div className="border-t border-b border-slate-300 py-4 mb-6 flex justify-between">
          <div>
            <p className="text-sm"><span className="font-medium">Invoice #:</span> <span id="print-invoice-id"></span></p>
            <p className="text-sm"><span className="font-medium">Date:</span> <span id="print-date"></span></p>
          </div>
          <div>
            <p className="text-sm"><span className="font-medium">Customer:</span> <span id="print-customer-name"></span></p>
          </div>
        </div>
        
        <table className="w-full mb-6">
          <colgroup>
            <col style={{ width: "55%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead className="border-b-2 border-slate-300">
            <tr>
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody id="print-items" className="break-words">
            {/* Items will be populated dynamically */}
          </tbody>
          <tfoot className="border-t border-slate-300">
            <tr>
              <td colSpan={3} className="py-2 text-right font-medium">Subtotal:</td>
              <td id="print-subtotal" className="py-2 text-right"></td>
            </tr>
            <tr>
              <td colSpan={3} className="py-2 text-right">Tax:</td>
              <td id="print-tax" className="py-2 text-right"></td>
            </tr>
            <tr className="border-t border-slate-300 font-bold">
              <td colSpan={3} className="py-2 text-right">Total:</td>
              <td id="print-total" className="py-2 text-right"></td>
            </tr>
          </tfoot>
        </table>
        
        <div className="text-center text-sm text-slate-500 mt-10">
          <p>Thank you for your business!</p>
          <p>Generated with BillMaker</p>
        </div>
      </div>
    </div>
  );
}
